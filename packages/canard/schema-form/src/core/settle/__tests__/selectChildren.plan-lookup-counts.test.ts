import { afterEach, describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as priming from '../utils/compute/primeHost';
import * as selection from '../utils/compute/selectChildren';
import * as planning from '../utils/compute/selectChildren/utils/getDirectChildSelectionPlan';
import * as publication from '../utils/gates/flushPendingGateReads';
import { createTestTree } from './fixtures/createTestTree';
import { createFixedBranchSchema } from './helpers/childSelection/createFixedBranchSchema';

/**
 * Count every runtime entry into the plan function, cache hits included.
 * @returns Live counter; restore mocks after the history completes
 */
const countPlanCalls = () => {
  const calls = { count: 0 };
  const original = planning.getDirectChildSelectionPlan;
  vi.spyOn(planning, 'getDirectChildSelectionPlan').mockImplementation((...args) => {
    calls.count++;
    return original(...args);
  });
  return calls;
};

/**
 * Split runtime entries into the pre-publication function by the pending set they see.
 * @returns Live counters of calls with an empty and a non-empty pending-output set
 */
const countFlushCalls = () => {
  const calls = { empty: 0, pending: 0 };
  const original = publication.flushPendingGateReads;
  vi.spyOn(publication, 'flushPendingGateReads').mockImplementation((template, path, context) => {
    if (context.pendingOutputs?.size) calls.pending++;
    else calls.empty++;
    return original(template, path, context);
  });
  return calls;
};

afterEach(() => { vi.restoreAllMocks(); });

// filid:contract settle-child-selection-lookup
describe('child selection plan lookup runtime counts', () => {
  it.each([false, true])('if-then with automatic writes disabled=%s enters the plan function only on the first write and pre-publication never', disabled => {
    const { root } = createTestTree({ type: 'object', properties: { kind: { type: 'string' } },
      if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
      then: { properties: { detail: { type: 'string', default: 'shown' } } },
    });
    const option = SetValueOption.Overwrite | (disabled ? SetValueOption.DisableAutomaticWrites : 0);
    const calls = countPlanCalls();
    const flushes = countFlushCalls();
    loadSchemaNodeAtMount(root, { kind: 'off' }, option);
    expect(calls.count).toBe(0);
    const perWrite: number[] = [];
    for (const kind of ['on', 'off', 'on', 'off', 'on']) {
      calls.count = 0;
      writeSchemaNode(root.structure!.kind, kind, 'input', option);
      perWrite.push(calls.count);
    }
    expect(perWrite[0]).toBeGreaterThan(0);
    expect(perWrite.slice(1)).toEqual([0, 0, 0, 0]);
    expect(flushes).toEqual({ empty: 0, pending: 0 });
    expect(root.children!.map(child => child.path)).toEqual(['/kind', '/detail']);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it.each([
    [5, 28], [10, 58], [20, 118], [40, 238],
  ])('B=%i mount enters pre-publication only with pending outputs (%i calls)', (count, pending) => {
    const { root } = createTestTree(createFixedBranchSchema(count));
    const calls = countFlushCalls();
    loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
    expect(calls).toEqual({ empty: 0, pending });
    expect(root.children).toHaveLength(5);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it.each([5, 10, 20, 40])('B=%i union transitions keep 1b candidate visits and stop plan calls after preparation', count => {
    const candidateVisits = new Array<number>(count).fill(0);
    let phase = '';
    for (const [module, key] of [[priming, 'primeHost'], [selection, 'selectChildren']] as const) {
      const original = module[key as keyof typeof module] as typeof selection.selectChildren;
      vi.spyOn(module as typeof selection, key as 'selectChildren').mockImplementation((...args) => {
        const previous = phase;
        phase = key;
        try { return Reflect.apply(original, undefined, args); }
        finally { phase = previous; }
      });
    }
    const { root } = createTestTree(createFixedBranchSchema(count));
    const candidates = new Proxy(root.behavior.declareChildren(root), {
      get(target, property, receiver) {
        const result = Reflect.get(target, property, receiver);
        if (phase && typeof property === 'string' && /^\d+$/.test(property)) {
          const branch = /payload_(\d+)_/.exec(result.name);
          if (branch) candidateVisits[Number(branch[1])]++;
        }
        return result;
      },
    });
    root.behavior.declareChildren = () => candidates;
    const calls = countPlanCalls();
    loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
    const perWrite: number[] = [];
    for (const [index, kind] of ['kind_4', 'kind_0', 'kind_4', 'kind_0'].entries()) {
      calls.count = 0;
      candidateVisits.fill(0);
      writeSchemaNode(root.structure!.kind, kind, 'input', SetValueOption.Overwrite);
      perWrite.push(calls.count);
      for (let branch = 0; branch < count; branch++) {
        if (branch === 0 || branch === 4) continue;
        expect({ branch, candidates: candidateVisits[branch] })
          .toEqual({ branch, candidates: index === 0 ? 3 : 0 });
      }
      expect(root.children).toHaveLength(5);
      expect(root.runtime.diagnostics.status).toBe('stable');
    }
    expect(perWrite[0]).toBeGreaterThan(0);
    expect(perWrite.slice(1)).toEqual([0, 0, 0]);
  });
});
