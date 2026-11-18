import { describe, expect, it } from 'vitest';
import { applyPatch } from '../applyPatch';

describe('round-2 json 1: borrowed root ownership', () => {
  it('a root move has the same isolated writes as a root copy', () => {
    const nested = Object.freeze({ value: 1 });
    const branch = Object.freeze({ nested });
    const source = Object.freeze({ branch });
    const copy = applyPatch(source, [{ op: 'copy', from: '/branch', path: '' }, { op: 'add', path: '/added', value: 3 }]);
    const moved = applyPatch(source, [{ op: 'move', from: '/branch', path: '' }, { op: 'add', path: '/added', value: 3 }]);
    expect(moved).toEqual(copy);
    expect(source.branch).toBe(branch);
    expect(source).toEqual({ branch: { nested: { value: 1 } } });
  });
  it('a moved array root keeps its input intact through a direct write', () => {
    const branch = Object.freeze([1, 2]);
    const source = Object.freeze({ branch });
    const copy = applyPatch(source, [{ op: 'copy', from: '/branch', path: '' }, { op: 'replace', path: '/0', value: 9 }]);
    expect(applyPatch(source, [{ op: 'move', from: '/branch', path: '' }, { op: 'replace', path: '/0', value: 9 }])).toEqual(copy);
    expect(branch).toEqual([1, 2]);
  });
  it('preserves nested writes after a moved root', () => {
    const branch = Object.freeze({ nested: Object.freeze({ value: 1 }) });
    const source = Object.freeze({ branch });
    expect(applyPatch(source, [{ op: 'move', from: '/branch', path: '' }, { op: 'replace', path: '/nested/value', value: 2 }])).toEqual({ nested: { value: 2 } });
    expect(branch.nested.value).toBe(1);
  });
});

describe('round-2 json 2: round-1 ancestor move regression control', () => {
  it.each([5, { d: 1 }])('moves %s into an ancestor after removing the source', value => {
    const source = { a: { b: { c: value } } };
    const snapshot = JSON.stringify(source);
    expect(applyPatch(source, [{ op: 'move', from: '/a/b/c', path: '/a' }])).toEqual({ a: value });
    expect(JSON.stringify(source)).toBe(snapshot);
  });
});
