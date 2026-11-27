import { describe, expect, it } from 'vitest';

import { applyPatch } from '../applyPatch';

describe('round-2 json 1: borrowed root ownership', () => {
  it('a moved array root keeps its input intact through a direct write', () => {
    const branch = Object.freeze([1, 2]);
    const source = Object.freeze({ branch });
    const copy = applyPatch(source, [
      { op: 'copy', from: '/branch', path: '' },
      { op: 'replace', path: '/0', value: 9 },
    ]);
    expect(
      applyPatch(source, [
        { op: 'move', from: '/branch', path: '' },
        { op: 'replace', path: '/0', value: 9 },
      ]),
    ).toEqual(copy);
    expect(branch).toEqual([1, 2]);
  });
});

describe('round-2 json 2: round-1 ancestor move regression control', () => {
  it.each([5, { d: 1 }])(
    'moves %s into an ancestor after removing the source',
    (value) => {
      const source = { a: { b: { c: value } } };
      const snapshot = JSON.stringify(source);
      expect(
        applyPatch(source, [{ op: 'move', from: '/a/b/c', path: '/a' }]),
      ).toEqual({ a: value });
      expect(JSON.stringify(source)).toBe(snapshot);
    },
  );
});
