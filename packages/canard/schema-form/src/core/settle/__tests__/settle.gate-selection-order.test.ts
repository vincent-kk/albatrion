import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as gateEvaluation from '../utils/gates/evaluateGate';
import { resolveDependencyPath } from '../utils/paths/resolveDependencyPath';
import { createTestTree } from './fixtures/createTestTree';
import { readProjectedValueWithoutPublication } from './helpers/readProjectedValueWithoutPublication';
import type { SettlementContext } from '../type';
import type { PlainNode } from './fixtures/createPlainNode';

/** Fixed live width and kind_0/kind_4 input size match the approved branch-axis row. */
const SCHEMA: BlueprintSchema = {
  type: 'object',
  properties: {
    common: { type: 'string', default: 'shared' },
    kind: { type: 'string', default: 'kind_0' },
  },
  oneOf: [0, 1, 2, 3, 4].map((index) => ({
    controls: { active: `./kind === 'kind_${index}'` },
    properties: {
      [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
      [`payload_${index}_b`]: { type: 'number', default: index },
      [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
    },
  })),
};

// filid:contract settle-gate-selection-order
describe('gate selection original-site shadow precondition', () => {
  it('excludes an unread undefined-raw host and rejects consumed or published pending nodes', () => {
    const { root } = createTestTree(SCHEMA);
    loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
    const context = { root, changedRaw: new Set(), changedNodes: new Set(),
      pendingOutputs: new Set([root]) } as unknown as SettlementContext<PlainNode>;
    expect(root.raw).toBeUndefined();
    expect(readProjectedValueWithoutPublication(context, '/kind')).toBe('kind_0');
    expect(() => readProjectedValueWithoutPublication(context, '')).toThrow('consumed or published');
    context.pendingOutputs!.add(root.structure!.kind);
    expect(() => readProjectedValueWithoutPublication(context, '/kind')).toThrow('/kind');
    context.pendingOutputs!.delete(root.structure!.kind);
    root.raw = null;
    expect(() => readProjectedValueWithoutPublication(context, '/kind')).toThrow('<root>');
  });

  it('full evaluation preserves the fixed branch transition and repeated references', () => {
    const { root } = createTestTree(SCHEMA);
    loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
    expect(root.emit).toEqual({ common: 'shared', kind: 'kind_0',
      payload_0_a: 'a_0', payload_0_b: 0, payload_0_c: true });
    writeSchemaNode(root.structure!.kind, 'kind_4', 'input', SetValueOption.Overwrite);
    const value = root.emit;
    expect(root.emit).toBe(value);
    expect(value).toEqual({ common: 'shared', kind: 'kind_4',
      payload_4_a: 'a_4', payload_4_b: 4, payload_4_c: true });
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('full evaluation leaves consumed and baseline-published nodes ready at every shadow read', () => {
    const { root, blueprint } = createTestTree(SCHEMA);
    const original = gateEvaluation.evaluateGate;
    const violations: { site: string; owner: string; edge?: string;
      phase: string; message: string; rootRaw: unknown; pending: string[] }[] = [];
    let shadowReads = 0;
    let phase = 'mount';
    const spy = vi.spyOn(gateEvaluation, 'evaluateGate').mockImplementation(
      (gate, context, owner, edge) => {
        const result = original(gate, context, owner, edge);
        if (gate.kind !== 'active') return result;
        const expression = blueprint.expressions.find((entry) =>
          entry.schemaPath === gate.schemaPath);
        if (!expression) return result;
        const changedBefore = [...context.changedNodes];
        const pendingBefore = [...context.pendingOutputs ?? []];
        const versionBefore = context.gateThrowVersion;
        try {
          const dependencies: unknown[] = [];
          for (let index = 0; index < expression.dependencies.length; index++)
            dependencies.push(readProjectedValueWithoutPublication(context,
              resolveDependencyPath(owner.path, expression.dependencies[index])));
          expect(Boolean(expression.evaluate(dependencies))).toBe(result);
          shadowReads++;
        } catch (cause) {
          violations.push({ site: gate.schemaPath, owner: owner.path, edge, phase,
            message: cause instanceof Error ? cause.message : String(cause),
            rootRaw: context.root.raw,
            pending: pendingBefore.map((node) => node.path || '<root>') });
        }
        expect([...context.changedNodes]).toEqual(changedBefore);
        expect([...context.pendingOutputs ?? []]).toEqual(pendingBefore);
        expect(context.gateThrowVersion).toBe(versionBefore);
        return result;
      },
    );
    try {
      loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
      phase = 'update';
      writeSchemaNode(root.structure!.kind, 'kind_4', 'input', SetValueOption.Overwrite);
    } finally {
      spy.mockRestore();
    }
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(shadowReads).toBeGreaterThan(0);
    expect({ count: violations.length,
      mount: violations.filter((entry) => entry.phase === 'mount').length,
      update: violations.filter((entry) => entry.phase === 'update').length,
      first: violations[0] }).toEqual({ count: 0, mount: 0, update: 0, first: undefined });
  });
});
