import { describe, expect, it } from 'vitest';

import type { Patch } from '../../../patchModel';
import { Operation } from '../../../patchModel';
import { applyPatch } from '../applyPatch';

describe('applyPatch copy-on-write', () => {
  it('shares untouched subtrees with the source', () => {
    const source = {
      a: { b: 'before' },
      c: { untouched: true },
    };
    const patches: Patch[] = [
      { op: Operation.REPLACE, path: '/a/b', value: 'after' },
    ];

    const result = applyPatch(source, patches);

    expect(result.c).toBe(source.c);
  });

  it('preserves the source when a touched path changes', () => {
    const source = {
      a: { b: 'before' },
      c: { untouched: true },
    };
    const patches: Patch[] = [
      { op: Operation.REPLACE, path: '/a/b', value: 'after' },
    ];

    applyPatch(source, patches);

    expect(source).toEqual({
      a: { b: 'before' },
      c: { untouched: true },
    });
  });

  it('preserves the source path removed by MOVE', () => {
    const source = {
      a: { b: null },
      x: { y: { value: 'moved' } },
    };
    const patches: Patch[] = [
      { op: Operation.MOVE, from: '/x/y', path: '/a/b' },
    ];

    applyPatch(source, patches);

    expect(source.x.y).toEqual({ value: 'moved' });
  });

  it('preserves a moved source subtree during a later patch', () => {
    const source = {
      a: {},
      x: { y: { value: 'before' } },
    };
    const patches: Patch[] = [
      { op: Operation.MOVE, from: '/x/y', path: '/a/moved' },
      {
        op: Operation.REPLACE,
        path: '/a/moved/value',
        value: 'after',
      },
    ];

    const result = applyPatch(source, patches);

    expect(result.a.moved).toEqual({ value: 'after' });
    expect(source.x.y).toEqual({ value: 'before' });
  });
});
