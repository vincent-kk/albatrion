import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' } } },
    },
  },
} as const;

const timeFindNodes = (count: number, pointer: string) => {
  const { root } = build(schema, {
    list: Array.from({ length: count }, (_, i) => ({ name: `n${i}` })),
  });
  root.findNodes(pointer);
  const start = performance.now();
  const found = root.findNodes(pointer).length;
  return { ms: performance.now() - start, found };
};

describe('[measurement] findNodes wildcard cost over a wide array', () => {
  it('4x items cost under 8x time for /list/*/name', () => {
    const small = timeFindNodes(5_000, '/list/*/name');
    const large = timeFindNodes(20_000, '/list/*/name');
    const ratio = large.ms / small.ms;
    diag('wildcardScale', { small, large, ratio });
    expect(large.found).toBe(20_000);
    expect(ratio).toBeLessThan(8);
  });
});
