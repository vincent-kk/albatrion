import { describe, expect, it } from 'vitest';

import { attempt, build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
} as const;

const INDEXES = [-1, -0, 0, 0.5, 1, 2, 3, 4, 1e21, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER];

const verbs: Record<string, (list: any, index: number) => unknown> = {
  insert: (list, index) => list.insert(index, 'z'),
  remove: (list, index) => list.remove(index),
  update: (list, index) => list.update(index, 'z'),
};

describe('BS2 array verb indexes: batch against sequential', () => {
  it('returns and values agree for every edge index', () => {
    const mismatches: unknown[] = [];
    for (const [verb, call] of Object.entries(verbs))
      for (const index of INDEXES) {
        const out: Record<string, unknown> = {};
        for (const mode of ['sequential', 'batch'] as const) {
          const { root } = build(schema, { list: ['a', 'b', 'c'] });
          const list = root.find('/list');
          let result: unknown;
          const thrown = attempt(() => {
            if (mode === 'batch')
              list.batch(() => {
                result = call(list, index);
              });
            else result = call(list, index);
          });
          out[mode] = JSON.stringify({ result, value: root.value.list, thrown: thrown && String(thrown) });
        }
        if (out.sequential !== out.batch)
          mismatches.push({ verb, index: String(index), ...out });
      }
    diag('IDX', mismatches);
    expect(mismatches).toEqual([]);
  });
});
