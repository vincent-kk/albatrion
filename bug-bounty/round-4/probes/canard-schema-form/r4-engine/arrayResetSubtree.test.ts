import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    },
  },
} as const;

const loaded = () => ({ list: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] });

const afterReset = (grow: (list: any) => void) => {
  const { root } = build(schema, loaded());
  const list = root.find('/list');
  grow(list);
  const before = JSON.stringify(root.value);
  list.resetSubtree();
  return { before, after: JSON.stringify(root.value) };
};

describe('array resetSubtree returns the array to its load value', () => {
  const expected = JSON.stringify(loaded());

  it('A1 after push', () => {
    const r = afterReset((list) => list.push({ name: 'r' }));
    diag('A1', r);
    expect(r.after).toBe(expected);
  });

  it('A2 after setValue with an updater that appends', () => {
    const r = afterReset((list) =>
      list.setValue((prev: any) => [...prev, { name: 'r' }]),
    );
    diag('A2', r);
    expect(r.after).toBe(expected);
  });

  it('A3 after setValue of a longer array', () => {
    const r = afterReset((list) =>
      list.setValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'r' }]),
    );
    diag('A3', r);
    expect(r.after).toBe(expected);
  });

  it('A4 after remove', () => {
    const r = afterReset((list) => list.remove(0));
    diag('A4', r);
    expect(r.after).toBe(expected);
  });

  it('A5 after root setValue of a longer list', () => {
    const r = afterReset((list) =>
      list.rootNode.setValue({
        list: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'r' }],
      }),
    );
    diag('A5', r);
    expect(r.after).toBe(expected);
  });

  it('A6 control: whole-form root resetSubtree after push', () => {
    const { root } = build(schema, loaded());
    root.find('/list').push({ name: 'r' });
    root.resetSubtree();
    diag('A6', JSON.stringify(root.value));
    expect(JSON.stringify(root.value)).toBe(expected);
  });
});
