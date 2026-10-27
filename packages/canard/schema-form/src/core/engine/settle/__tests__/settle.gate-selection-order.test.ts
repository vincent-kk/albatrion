import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { engineModes } from '../../utils/cache/engineModes';
import { resolveDependencyPath } from '../../utils/paths/resolveDependencyPath';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import type { SettlementContext } from '../types/settlement';
import * as gateEvaluation from '../utils/gates/evaluateGate';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { readProjectedValueWithoutPublication } from './helpers/readProjectedValueWithoutPublication';

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
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    const context = {
      root,
      changedRaw: new Set(),
      changedNodes: new Set(),
      pendingOutputs: new Set([root]),
    } as unknown as SettlementContext<PlainNode>;
    expect(root.raw).toBeUndefined();
    expect(readProjectedValueWithoutPublication(context, '/kind')).toBe(
      'kind_0',
    );
    expect(() => readProjectedValueWithoutPublication(context, '')).toThrow(
      'consumed or published',
    );
    context.pendingOutputs!.add(root.structure!.kind);
    expect(() =>
      readProjectedValueWithoutPublication(context, '/kind'),
    ).toThrow('/kind');
    context.pendingOutputs!.delete(root.structure!.kind);
    root.raw = null;
    expect(() =>
      readProjectedValueWithoutPublication(context, '/kind'),
    ).toThrow('<root>');
  });

  it('full evaluation preserves the fixed branch transition and repeated references', () => {
    const { root } = createTestTree(SCHEMA);
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    expect(root.emit).toEqual({
      common: 'shared',
      kind: 'kind_0',
      payload_0_a: 'a_0',
      payload_0_b: 0,
      payload_0_c: true,
    });
    writeFieldNode(
      root.structure!.kind,
      'kind_4',
      'input',
      WriteOption.Overwrite,
    );
    const value = root.emit;
    expect(root.emit).toBe(value);
    expect(value).toEqual({
      common: 'shared',
      kind: 'kind_4',
      payload_4_a: 'a_4',
      payload_4_b: 4,
      payload_4_c: true,
    });
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('full evaluation leaves consumed and baseline-published nodes ready at every shadow read', () => {
    const { root, blueprint } = createTestTree(SCHEMA);
    const previousMode = engineModes.gateSelection;
    // Pin the full-evaluation reference path without the table.
    engineModes.setMode('gateSelection', 'off');
    const original = gateEvaluation.evaluateGate;
    const violations: {
      site: string;
      owner: string;
      edge?: string;
      phase: string;
      message: string;
      rootRaw: unknown;
      pending: string[];
    }[] = [];
    let shadowReads = 0;
    let phase = 'mount';
    const spy = vi
      .spyOn(gateEvaluation, 'evaluateGate')
      .mockImplementation((gate, context, owner, edge) => {
        const result = original(gate, context, owner, edge);
        if (gate.kind !== 'active') return result;
        const expression = blueprint.expressions.find(
          (entry) => entry.schemaPath === gate.schemaPath,
        );
        if (!expression) return result;
        const changedBefore = [...context.changedNodes];
        const pendingBefore = [...(context.pendingOutputs ?? [])];
        const versionBefore = context.gateThrowVersion;
        try {
          const dependencies: unknown[] = [];
          for (let index = 0; index < expression.dependencies.length; index++)
            dependencies.push(
              readProjectedValueWithoutPublication(
                context,
                resolveDependencyPath(
                  owner.path,
                  expression.dependencies[index],
                ),
              ),
            );
          expect(Boolean(expression.evaluate(dependencies))).toBe(result);
          shadowReads++;
        } catch (cause) {
          violations.push({
            site: gate.schemaPath,
            owner: owner.path,
            edge,
            phase,
            message: cause instanceof Error ? cause.message : String(cause),
            rootRaw: context.root.raw,
            pending: pendingBefore.map((node) => node.path || '<root>'),
          });
        }
        expect([...context.changedNodes]).toEqual(changedBefore);
        expect([...(context.pendingOutputs ?? [])]).toEqual(pendingBefore);
        expect(context.gateThrowVersion).toBe(versionBefore);
        return result;
      });
    try {
      loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
      phase = 'update';
      writeFieldNode(
        root.structure!.kind,
        'kind_4',
        'input',
        WriteOption.Overwrite,
      );
    } finally {
      spy.mockRestore();
      engineModes.setMode('gateSelection', previousMode);
    }
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(shadowReads).toBeGreaterThan(0);
    expect({
      count: violations.length,
      mount: violations.filter((entry) => entry.phase === 'mount').length,
      update: violations.filter((entry) => entry.phase === 'update').length,
      first: violations[0],
    }).toEqual({ count: 0, mount: 0, update: 0, first: undefined });
  });
});
