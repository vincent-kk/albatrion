import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as compiler from '../../blueprint/compileBlueprintExpressions/createDynamicFunction';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as selection from '../utils/compute/childSelection/selectChildren';
import * as priming from '../utils/compute/primeHost';
import * as gates from '../utils/gates/evaluateGate';
import * as publication from '../utils/gates/flushPendingGateReads';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createFixedBranchSchema } from './fixtures/childSelection/createFixedBranchSchema';
import { observeChildSelectionPlans } from './fixtures/childSelection/observeChildSelectionPlans';
import { expectedGateSelectionCalls } from './fixtures/expectedGateSelectionCalls';

// filid:contract settle-child-selection-metadata
describe('mount-prepared child selection metadata runtime visits', () => {
  it.each([5, 10, 20, 40])(
    'B=%i preserves exact expression and gate counts for the selected mode',
    (count) => {
      const evaluations = new Array<number>(count).fill(0);
      const gateVisits = new Array<number>(count).fill(0);
      const candidateVisits = new Array<number>(count).fill(0);
      const flushVisits = new Array<number>(count).fill(0);
      let phase = '';
      const compile = compiler.createDynamicFunction;
      vi.spyOn(compiler, 'createDynamicFunction').mockImplementation(
        (manager, key, source, boolean) => {
          const evaluate = boolean
            ? compile(manager, key, source, true)
            : compile(manager, key, source, false);
          if (!evaluate) return;
          const branch = /kind_(\d+)/.exec(source ?? '');
          return (dependencies) => {
            if (key === 'active' && branch) evaluations[Number(branch[1])]++;
            return evaluate(dependencies);
          };
        },
      );
      const evaluate = gates.evaluateGate;
      vi.spyOn(gates, 'evaluateGate').mockImplementation((gate, ...args) => {
        const branch = /kind_(\d+)/.exec(String(gate.condition));
        if (branch) gateVisits[Number(branch[1])]++;
        return evaluate(gate, ...args);
      });
      for (const [module, key] of [
        [priming, 'primeHost'],
        [selection, 'selectChildren'],
      ] as const) {
        const original = module[
          key as keyof typeof module
        ] as typeof selection.selectChildren;
        vi.spyOn(
          module as typeof selection,
          key as 'selectChildren',
        ).mockImplementation((...args) => {
          const previous = phase;
          phase = key;
          try {
            return Reflect.apply(original, undefined, args);
          } finally {
            phase = previous;
          }
        });
      }
      const flush = publication.flushPendingGateReads;
      vi.spyOn(publication, 'flushPendingGateReads').mockImplementation(
        (template, path, context) => {
          const branch = /payload_(\d+)_/.exec(path);
          if (branch) flushVisits[Number(branch[1])]++;
          return flush(template, path, context);
        },
      );
      const previousMode = engineModes.gateWheel;
      try {
        engineModes.setMode('gateWheel', 'record');
        const builds = observeChildSelectionPlans();
        const { root } = createTestTree(createFixedBranchSchema(count));
        const declare = root.behavior.declareChildren;
        const candidates = new Proxy(declare(root), {
          get(target, property, receiver) {
            const result = Reflect.get(target, property, receiver);
            if (
              phase &&
              typeof property === 'string' &&
              /^\d+$/.test(property)
            ) {
              const branch = /payload_(\d+)_/.exec(result.name);
              if (branch) candidateVisits[Number(branch[1])]++;
            }
            return result;
          },
        });
        root.behavior.declareChildren = () => candidates;
        loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
        expect(builds.plans).toHaveLength(1);
        const mountPlans = builds.plans.length;
        writeFieldNode(
          root.structure!.common,
          'new common',
          'input',
          WriteOption.Overwrite,
        );
        expect(builds.plans).toHaveLength(1);
        for (const [index, kind] of [
          'kind_4',
          'kind_0',
          'kind_4',
          'kind_0',
        ].entries()) {
          evaluations.fill(0);
          gateVisits.fill(0);
          candidateVisits.fill(0);
          flushVisits.fill(0);
          const beforeWrite = builds.plans.length;
          writeFieldNode(
            root.structure!.kind,
            kind,
            'input',
            WriteOption.Overwrite,
          );
          expect(builds.hosts).toEqual([root.blueprintNode]);
          const writePlans = builds.plans.length - beforeWrite;
          expect(writePlans).toBe(0);
          if (index === 0) expect(mountPlans + writePlans).toBe(1);
          const expected = expectedGateSelectionCalls(
            engineModes.gateSelection,
            index === 0,
          );
          expect(evaluations).toEqual(
            new Array(count).fill(expected.expressions),
          );
          expect(gateVisits).toEqual(new Array(count).fill(expected.gates));
          for (let branch = 0; branch < count; branch++) {
            if (branch === 0 || branch === 4) continue;
            expect({
              branch,
              candidates: candidateVisits[branch],
              flushes: flushVisits[branch],
            }).toEqual({ branch, candidates: 0, flushes: 0 });
          }
          expect(root.children).toHaveLength(5);
          expect(root.runtime.diagnostics.status).toBe('stable');
        }
      } finally {
        vi.restoreAllMocks();
        engineModes.setMode('gateWheel', previousMode);
      }
    },
  );

  it.each([false, true])(
    'if-then with automatic writes disabled=%s never prepares a plan',
    (disabled) => {
      const builds = observeChildSelectionPlans();
      try {
        const { root } = createTestTree({
          type: 'object',
          properties: { kind: { type: 'string' } },
          if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
          then: {
            properties: { detail: { type: 'string', default: 'shown' } },
          },
        });
        const option =
          WriteOption.Overwrite |
          (disabled ? WriteOption.DisableAutomaticWrites : 0);
        loadFieldNodeAtMount(root, { kind: 'off' }, option);
        for (const kind of ['on', 'off', 'on'])
          writeFieldNode(root.structure!.kind, kind, 'input', option);
        expect(builds.plans).toHaveLength(0);
        expect(root.runtime.diagnostics.status).toBe('stable');
      } finally {
        vi.restoreAllMocks();
      }
    },
  );

  it('a single union branch never prepares a plan', () => {
    const builds = observeChildSelectionPlans();
    try {
      const { root } = createTestTree(createFixedBranchSchema(1));
      loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
      for (const kind of ['absent', 'kind_0', 'absent'])
        writeFieldNode(
          root.structure!.kind,
          kind,
          'input',
          WriteOption.Overwrite,
        );
      expect(builds.plans).toHaveLength(0);
      expect(root.runtime.diagnostics.status).toBe('stable');
    } finally {
      vi.restoreAllMocks();
    }
  });
});
