import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { getGateExpression } from '../utils/gates/getGateExpression';
import * as reads from '../utils/gates/readProjectedValue';
import { createTestTree } from './fixtures/createTestTree';

describe('gate dependency read work', () => {
  it('reads every dependency in order without invoking its array map', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      anyOf: [{ controls: { active: "@.gate() && ./a === 'A' && ./b === 'B'" },
        properties: { payload: { type: 'string', default: 'P' } } }],
    });
    const expression = getGateExpression(blueprint, '#/anyOf/0/controls/active');
    expect(expression).toBeDefined();
    const gate = vi.fn(() => true);
    root.runtime.context = { gate };
    let mapCalls = 0;
    const nativeMap = Array.prototype.map;
    const mapped = vi.spyOn(Array.prototype, 'map').mockImplementation(function (
      this: unknown[], callback, thisArg,
    ) {
      if (this === expression!.dependencies &&
        new Error().stack?.includes('evaluateGate.ts')) mapCalls++;
      return Reflect.apply(nativeMap, this, [callback, thisArg]);
    });
    const projected = vi.spyOn(reads, 'readProjectedValue');
    const order: string[] = [];
    try {
      loadSchemaNodeAtMount(root, { a: 'A', b: 'B' }, SetValueOption.Overwrite);
      expect(root.emit).toEqual({ a: 'A', b: 'B', payload: 'P' });
      writeSchemaNode(root.structure!.a, 'other', 'input', SetValueOption.Overwrite);
      expect(root.emit).toEqual({ a: 'other', b: 'B' });
      for (const [, path] of projected.mock.calls)
        if (path === '/a' || path === '/b') order.push(path);
    } finally {
      mapped.mockRestore();
      projected.mockRestore();
    }
    expect(order.length).toBeGreaterThan(0);
    for (let index = 0; index < order.length; index++)
      expect(order[index]).toBe(index % 2 === 0 ? '/a' : '/b');
    expect(gate.mock.calls.length).toBeGreaterThan(1);
    console.log(`106COUNT gate-read map=${mapCalls} projected=${order.length} evaluate=${gate.mock.calls.length}`);
    expect(mapCalls).toBe(0);
  });
});
