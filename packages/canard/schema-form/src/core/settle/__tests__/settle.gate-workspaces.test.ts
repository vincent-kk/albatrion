import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import * as compiler from '../../blueprint/utils/expressions/createDynamicFunction';
import { loadSchemaNodeAtMount } from '../index';
import { evaluateGate } from '../utils/gates/evaluateGate';
import * as projection from '../utils/gates/readProjectedValue';
import type { SettlementContext } from '../type';
import { createTestTree } from './fixtures/createTestTree';
import type { PlainNode } from './fixtures/createPlainNode';

describe('compiled active gate workspace characterization', () => {
  it.each([false, true])('preserves outer dependencies across a nested read, throw=%s', throws => {
    const calls: unknown[][] = [];
    const compile = compiler.createDynamicFunction;
    let recording = false;
    const compiling = vi.spyOn(compiler, 'createDynamicFunction').mockImplementation(
      (manager, key, source, boolean) => {
        const original = boolean ? compile(manager, key, source, true) : compile(manager, key, source, false);
        if (!original) return;
        return (dependencies: unknown[]) => {
          if (recording && key === 'active') calls.push(dependencies.slice());
          return original(dependencies);
        };
      });
    try {
      const { root, blueprint } = createTestTree({ type: 'object', properties: {
        a: { type: 'string', default: 'A' }, b: { type: 'string', default: 'B' },
      }, oneOf: [
        { controls: { active: "./a === 'A' && ./b === 'B'" } },
        { controls: { active: "./b === 'B'" } },
      ] });
      loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
      const gates = root.blueprintNode.declarations.flatMap(declaration => declaration.gates);
      const outer = gates.find(gate => gate.schemaPath === blueprint.expressions[0].schemaPath)!;
      const inner = gates.find(gate => gate.schemaPath === blueprint.expressions[1].schemaPath)!;
      const context = { root, changedRaw: new Set(), changedNodes: new Set(),
        pendingOutputs: new Set() } as unknown as SettlementContext<PlainNode>;
      const read = projection.readProjectedValue;
      let nested = false;
      const reading = vi.spyOn(projection, 'readProjectedValue').mockImplementation((current, path) => {
        if (!nested && path === '/b') {
          nested = true;
          expect(evaluateGate(inner, context, root)).toBe(true);
          if (throws) throw new Error('outer projected read');
        }
        return read(current, path);
      });
      recording = true;
      try {
        expect(evaluateGate(outer, context, root)).toBe(!throws);
        reading.mockRestore();
        expect(evaluateGate(outer, context, root)).toBe(true);
        expect(calls).toEqual(throws ? [['B'], ['A', 'B']] : [['B'], ['A', 'B'], ['A', 'B']]);
        expect(context.gateThrowVersion).toBe(throws ? 1 : undefined);
        expect([...context.changedNodes]).toEqual([]);
        expect([...context.pendingOutputs!]).toEqual([]);
      } finally { reading.mockRestore(); }
    } finally { compiling.mockRestore(); }
  });
});
