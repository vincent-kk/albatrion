import { describe, expect, it } from 'vitest';

import { applyPatch } from '../applyPatch';

/** Freezes the caller-owned graph so an accidental write fails at its origin. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

describe('round-3 root ownership', () => {
  it('every root operation preserves frozen caller graphs in immutable mode', () => {
    for (const source of [{ item: 1 }, [1]]) {
      freeze(source);
      const value = freeze({ child: { count: 1 } });
      const cases: [Parameters<typeof applyPatch>[1], unknown][] = [
        [[{ op: 'add', path: '', value }], value],
        [[{ op: 'replace', path: '', value }], value],
        [[{ op: 'remove', path: '' }], null],
        [[{ op: 'test', path: '', value: source }], source],
        [[{ op: 'copy', from: '', path: '' }], source],
        [[{ op: 'move', from: '', path: '' }], source],
      ];
      for (const [patches, expected] of cases) {
        const result = applyPatch(source, patches);
        if (expected === null) expect(result).toBeNull();
        else expect(result).toEqual(expected);
      }
    }
  });

  it('root copy and move own the resulting object before depth-one writes', () => {
    const child = freeze({ count: 1 });
    const source = freeze({ child });
    for (const op of ['copy', 'move'] as const) {
      expect(
        applyPatch(source, [
          { op, from: '/child', path: '' },
          { op: 'replace', path: '/count', value: 2 },
        ]),
      ).toEqual({ count: 2 });
    }
    expect(source.child.count).toBe(1);
  });

  it('both modes give equivalent values for each root operation and depth-one writes', () => {
    for (const immutable of [true, false]) {
      for (const op of ['add', 'replace'] as const) {
        const value = { count: 1 };
        expect(
          applyPatch(
            {},
            [
              { op, path: '', value },
              { op: 'replace', path: '/count', value: 2 },
            ],
            { immutable },
          ),
        ).toEqual({ count: 2 });
        expect(value.count).toBe(immutable ? 1 : 2);
      }
      for (const op of ['copy', 'move'] as const) {
        const source = { child: { count: 1 } };
        expect(
          applyPatch(
            source,
            [
              { op, from: '/child', path: '' },
              { op: 'replace', path: '/count', value: 2 },
            ],
            { immutable },
          ),
        ).toEqual({ count: 2 });
      }
    }
  });
  it('deep writes and reserved pointer spellings retain caller ownership', () => {
    for (const op of ['add', 'replace'] as const) {
      const value = freeze({ a: { b: { c: 1 } }, ['__proto__']: { x: 1 } });
      for (const path of ['/__proto__/x', '#/__proto__/x']) {
        expect(
          applyPatch({}, [
            { op, path: '', value },
            { op: 'replace', path: '/a/b/c', value: 2 },
            { op: 'move', from: '/a/b/c', path: '/d' },
            { op: 'replace', path, value: 9 },
          ]),
        ).toEqual({ a: { b: {} }, d: 2, ['__proto__']: { x: 9 } });
      }
      expect(value).toEqual({ a: { b: { c: 1 } }, ['__proto__']: { x: 1 } });
    }
  });
});
