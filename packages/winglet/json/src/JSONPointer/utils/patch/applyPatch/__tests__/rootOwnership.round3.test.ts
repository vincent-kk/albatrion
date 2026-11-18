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
  it('root add and replace are equivalent to adding an owned child, for objects and arrays', () => {
    for (const op of ['add', 'replace'] as const) {
      const object = freeze({ item: { count: 1 } });
      const array = freeze([{ count: 1 }]);
      const source = freeze({ object, array });
      expect(
        applyPatch(source, [
          { op, path: '', value: object },
          { op: 'replace', path: '/item/count', value: 2 },
          { op: 'add', path: '/extra', value: true },
        ]),
      ).toEqual({ item: { count: 2 }, extra: true });
      expect(
        applyPatch(source, [
          { op, path: '', value: array },
          { op: 'replace', path: '/0/count', value: 2 },
          { op: 'add', path: '/-', value: { count: 3 } },
        ]),
      ).toEqual([{ count: 2 }, { count: 3 }]);
      expect(source).toEqual({
        object: { item: { count: 1 } },
        array: [{ count: 1 }],
      });
    }
  });

  it('a failed batch preserves its caller value and the patch can be reused', () => {
    const value = freeze({ a: 1, b: { count: 1 } });
    const patches: Parameters<typeof applyPatch>[1] = [
      { op: 'replace', path: '', value },
      { op: 'remove', path: '/a' },
    ];
    expect(applyPatch({}, patches)).toEqual(applyPatch({}, patches));
    expect(() =>
      applyPatch({}, [...patches, { op: 'remove', path: '/missing' }]),
    ).toThrow();
    expect(value).toEqual({ a: 1, b: { count: 1 } });
  });

  it('every root operation preserves frozen caller graphs in immutable mode', () => {
    for (const source of [{ item: 1 }, [1]]) {
      freeze(source);
      const value = freeze({ child: { count: 1 } });
      const cases: Parameters<typeof applyPatch>[1][] = [
        [{ op: 'add', path: '', value }],
        [{ op: 'replace', path: '', value }],
        [{ op: 'remove', path: '' }],
        [{ op: 'test', path: '', value: source }],
        [{ op: 'copy', from: '', path: '' }],
        [{ op: 'move', from: '', path: '' }],
      ];
      for (const patches of cases) {
        const first = applyPatch(source, patches);
        expect(first).toEqual(applyPatch(source, patches));
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

  it('primitive replacement roots retain the same root-only behavior in both modes', () => {
    for (const immutable of [true, false]) {
      for (const value of [1, 'value', true, null]) {
        for (const op of ['add', 'replace'] as const) {
          expect(
            applyPatch(
              {},
              [
                { op, path: '', value },
                { op: 'test', path: '', value },
              ],
              { immutable },
            ),
          ).toBe(value);
          expect(
            applyPatch(
              {},
              [
                { op, path: '', value },
                { op: 'remove', path: '' },
              ],
              { immutable },
            ),
          ).toBe(null);
          expect(
            applyPatch(
              {},
              [
                { op, path: '', value },
                { op: 'move', from: '', path: '' },
              ],
              { immutable },
            ),
          ).toBe(value);
          expect(
            applyPatch(
              {},
              [
                { op, path: '', value },
                { op: 'copy', from: '', path: '' },
              ],
              { immutable },
            ),
          ).toBe(value);
        }
      }
    }
  });
});
