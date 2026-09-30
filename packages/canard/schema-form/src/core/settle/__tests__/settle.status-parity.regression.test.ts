import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { getTransitionCap } from '../utils/transition/getTransitionCap';
import { createTestTree } from './fixtures/createTestTree';

describe('settle status parity regressions', () => {
  it('SETTLE-029 gives same-shape loads the same status', () => {
    const schema = { type: 'object', properties: {
      a: { type: 'number', default: 1 },
      b: { type: 'number', controls: { active: '../a' } },
    } } as const;
    const first = createTestTree(schema).root;
    const second = createTestTree(schema).root;
    loadSchemaNodeAtMount(first, { b: 5 }, SetValueOption.Overwrite);
    loadSchemaNodeAtMount(second, { a: 1, b: 5 }, SetValueOption.Overwrite);
    expect(first.structure?.b).toBeDefined();
    expect(second.structure?.b).toBeDefined();
    expect(first.emit).toEqual({ a: 1, b: 5 });
    expect(first.emit).toEqual(second.emit);
    expect(first.runtime.diagnostics.status).toBe(second.runtime.diagnostics.status);
    expect(first.runtime.diagnostics.status).toBe('stable');
  });

  it('keeps transition attribution when a fill flips gates beyond the round cap', () => {
    const { root, blueprint } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
      b: { type: 'boolean', default: true },
    }, allOf: [
      { controls: { active: './b && ./a === "0"' },
        properties: { a: { type: 'boolean' } } },
      { controls: { active: './b && ./a !== "0"' },
        properties: { a: { type: 'string' } } },
    ] });
    const cap = getTransitionCap(blueprint);
    expect(() => loadSchemaNodeAtMount(root, { a: 0 }, SetValueOption.Overwrite))
      .toThrow();
    expect(root.raw).toEqual({ a: 0 });
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'transition', iterations: cap });
  });
});
