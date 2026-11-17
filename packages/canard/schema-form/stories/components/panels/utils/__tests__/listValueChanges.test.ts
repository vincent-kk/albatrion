import { describe, expect, it } from 'vitest';

import { listValueChanges } from '../listValueChanges';

describe('listValueChanges', () => {
  it('reports nothing for structurally equal values', () => {
    expect(listValueChanges({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] })).toEqual({ changes: [], total: 0 });
  });
  it('lists changes in the current key order, then keys only the baseline has', () => {
    expect(listValueChanges({ a: 1, b: { c: 2 }, d: 'gone' }, { e: true, a: 1, b: { c: 3 } })).toEqual({
      changes: [
        { path: '/e', kind: 'added', after: true },
        { path: '/b/c', kind: 'changed', before: 2, after: 3 },
        { path: '/d', kind: 'removed', before: 'gone' },
      ],
      total: 3,
    });
  });
  it('compares arrays by position, reporting extra and missing items', () => {
    expect(listValueChanges(['a', 'b'], ['a', 'c', 'd']).changes).toEqual([
      { path: '/1', kind: 'changed', before: 'b', after: 'c' },
      { path: '/2', kind: 'added', after: 'd' },
    ]);
  });
  it('keeps a present undefined apart from a missing key', () => {
    expect(listValueChanges({}, { a: undefined }).changes).toEqual([{ path: '/a', kind: 'added', after: undefined }]);
  });
  it('reports a container kind change as one entry, including at the root', () => {
    expect(listValueChanges({ a: [1] }, { a: { 0: 1 } }).changes).toEqual([
      { path: '/a', kind: 'changed', before: [1], after: { 0: 1 } },
    ]);
    expect(listValueChanges(undefined, { a: 1 }).changes).toEqual([
      { path: '', kind: 'changed', before: undefined, after: { a: 1 } },
    ]);
  });
  it('escapes "~" and "/" in property names', () => {
    expect(listValueChanges({}, { 'a/b~c': 1 }).changes[0].path).toBe('/a~1b~0c');
  });
  it('keeps at most limit entries while counting every difference', () => {
    const result = listValueChanges([], [1, 2, 3, 4, 5], 2);
    expect(result.changes.map(({ path }) => path)).toEqual(['/0', '/1']);
    expect(result.total).toBe(5);
  });
  it('compares non-plain objects such as files by identity', () => {
    const file = new File(['x'], 'a.txt');
    expect(listValueChanges({ f: file }, { f: file }).total).toBe(0);
    expect(listValueChanges({ f: file }, { f: new File(['x'], 'a.txt') }).total).toBe(1);
  });
});
