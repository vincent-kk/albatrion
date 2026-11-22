import { describe, expect, it } from 'vitest';

import { attempt, build, diag } from './probeHelpers';

/** Run the same calls with and without an enclosing batch on the root. */
const both = (
  schema: unknown,
  defaultValue: unknown,
  prepare: (root: any) => void,
  calls: (root: any) => void,
) => {
  const results: Record<string, unknown> = {};
  for (const mode of ['sequential', 'batch'] as const) {
    const { root } = build(schema, defaultValue);
    prepare(root);
    const thrown = attempt(() =>
      mode === 'batch' ? root.batch(() => calls(root)) : calls(root),
    );
    results[mode] = { value: root.value, thrown: thrown && String(thrown) };
  }
  return results as Record<'sequential' | 'batch', { value: unknown }>;
};

describe('EQ2 resetSubtree inside a batch after an ancestor write', () => {
  it('R1 push on the array, then reset an edited item', () => {
    const r = both(
      {
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      },
      { list: ['a', 'b', 'c'] },
      (root) => root.find('/list/0').setValue('EDITED'),
      (root) => {
        const list = root.find('/list');
        const item = root.find('/list/0');
        list.push('x');
        item.resetSubtree();
      },
    );
    diag('R1', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('R2 root setValue, then reset one section', () => {
    const r = both(
      {
        type: 'object',
        properties: {
          o: { type: 'object', properties: { a: { type: 'string' } } },
          s: { type: 'string' },
        },
      },
      { o: { a: 'loaded' }, s: 'loaded' },
      () => {},
      (root) => {
        const o = root.find('/o');
        root.setValue({ o: { a: 'server' }, s: 'server' });
        o.resetSubtree();
      },
    );
    diag('R2', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('R3 the reset is visible inside the batch and undone when the batch ends', () => {
    const { root } = build(
      {
        type: 'object',
        properties: {
          o: { type: 'object', properties: { a: { type: 'string' } } },
          s: { type: 'string' },
        },
      },
      { o: { a: 'loaded' }, s: 'loaded' },
    );
    const o = root.find('/o');
    let inside: unknown;
    root.batch(() => {
      root.setValue({ o: { a: 'server' }, s: 'server' });
      o.resetSubtree();
      inside = o.value;
    });
    diag('R3', { inside, after: o.value });
    expect({ inside, after: o.value }).toEqual({
      inside: { a: 'loaded' },
      after: { a: 'loaded' },
    });
  });
});
