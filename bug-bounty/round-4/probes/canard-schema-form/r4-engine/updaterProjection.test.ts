import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

/**
 * packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:82
 * "An updater receives the same projected value as getValue()".
 */
const schema = {
  type: 'object',
  properties: {
    trailing: {
      type: 'array',
      items: { type: 'string' },
      options: { omitTrailingEmpty: true },
    },
    empty: { type: 'array', items: { type: 'string' } },
    name: { type: 'string' },
  },
} as const;

describe('CA2 an updater receives the value getValue() returns', () => {
  it('P1 root updater input equals the root output (getValue)', () => {
    const { root } = build(schema, { trailing: ['a', ''], empty: [], name: 'n' });
    let received: unknown;
    root.setValue((prev: unknown) => {
      received = prev;
      return prev;
    });
    diag('P1', { received, getValue: root.outputValue, value: root.value });
    expect(received).toEqual(root.outputValue);
  });

  it('P2 array updater input equals that array node output', () => {
    const { root } = build(schema, { trailing: ['a', ''], name: 'n' });
    let received: unknown;
    root.find('/trailing').setValue((prev: unknown) => {
      received = prev;
      return prev;
    });
    diag('P2', { received, output: root.find('/trailing').outputValue });
    expect(received).toEqual(root.find('/trailing').outputValue);
  });
});
