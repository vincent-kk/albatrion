import { describe, expect, it } from 'vitest';

import { attempt, build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
} as const;

/** Run the same calls with and without an enclosing batch. */
const both = (calls: (list: any, items: any[]) => void) => {
  const results: Record<string, unknown> = {};
  for (const mode of ['sequential', 'batch'] as const) {
    const { root } = build(schema, { list: ['a', 'b', 'c'] });
    const list = root.find('/list');
    const items = [...list.children];
    const thrown = attempt(() =>
      mode === 'batch' ? list.batch(() => calls(list, items)) : calls(list, items),
    );
    results[mode] = { value: root.value.list, thrown: thrown && String(thrown) };
  }
  return results as Record<'sequential' | 'batch', { value: unknown }>;
};

describe('EQ2 an item node write after an array verb in the same batch', () => {
  it('P1 remove(0) then write the item that held "b"', () => {
    const r = both((list, items) => {
      list.remove(0);
      items[1].setValue('Z');
    });
    diag('P1', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('P2 remove(1) then write the removed item', () => {
    const r = both((list, items) => {
      list.remove(1);
      items[1].setValue('Z');
    });
    diag('P2', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('P3 pop() then write the popped item', () => {
    const r = both((list, items) => {
      list.pop();
      items[2].setValue('Z');
    });
    diag('P3', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('P4 insert(0) then write the item that held "a"', () => {
    const r = both((list, items) => {
      list.insert(0, 'n');
      items[0].setValue('Z');
    });
    diag('P4', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });
});
