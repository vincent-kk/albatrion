import { describe, expect, it } from 'vitest';

import { applyPatch } from '../index';

/** Freezes caller containers so writes fail at their origin. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

describe('round-3 json 1: lazy root ownership', () => {
  it('root and nested installations share the same untouched object or array', () => {
    for (const op of ['add', 'replace', 'move'] as const) {
      for (const value of [{ child: { count: 1 } }, [{ count: 1 }]]) {
        freeze(value);
        const rootSource = freeze({ donor: value });
        const nestedSource = freeze({ donor: value, target: null });
        const rootPatch: Parameters<typeof applyPatch>[1] =
          op === 'move'
            ? [{ op, from: '/donor', path: '' }]
            : [{ op, path: '', value }];
        const nestedPatch: Parameters<typeof applyPatch>[1] =
          op === 'move'
            ? [{ op, from: '/donor', path: '/target' }]
            : [{ op, path: '/target', value }];
        const nested = applyPatch<{ target: typeof value }>(
          nestedSource,
          nestedPatch,
        );
        expect(applyPatch(rootSource, rootPatch)).toBe(nested.target);
        expect(nested.target).toBe(value);
        expect(
          applyPatch(rootSource, [
            ...rootPatch,
            { op: 'test', path: '', value },
          ]),
        ).toBe(value);
      }
    }
  });

  it('root and nested installations isolate every following write from frozen callers', () => {
    for (const op of ['add', 'replace', 'move'] as const) {
      for (const array of [false, true]) {
        const value = freeze(array ? [{ count: 1 }] : { child: { count: 1 } });
        const source = freeze({ donor: value, target: null });
        const snapshot = JSON.stringify(source);
        const first: Parameters<typeof applyPatch>[1][number] =
          op === 'move'
            ? { op, from: '/donor', path: '' }
            : { op, path: '', value };
        const nestedFirst = { ...first, path: '/target' };
        const writes: Parameters<typeof applyPatch>[1][] = array
          ? [
              [{ op: 'replace', path: '/0/count', value: 2 }],
              [
                { op: 'add', path: '/-', value: freeze({ count: 3 }) },
                { op: 'replace', path: '/1/count', value: 4 },
              ],
              [{ op: 'remove', path: '/0' }],
            ]
          : [
              [{ op: 'replace', path: '/child/count', value: 2 }],
              [
                { op: 'add', path: '/extra', value: freeze({ count: 3 }) },
                { op: 'replace', path: '/extra/count', value: 4 },
              ],
              [{ op: 'remove', path: '/child' }],
            ];
        for (const sequence of writes) {
          const nestedSequence = sequence.map((patch) => ({
            ...patch,
            path: '/target' + patch.path,
          }));
          const expected = applyPatch<{ target: unknown }>(source, [
            nestedFirst,
            ...nestedSequence,
          ]).target;
          expect(applyPatch(source, [first, ...sequence])).toEqual(expected);
          const failing: Parameters<typeof applyPatch>[1] = [
            ...sequence,
            { op: 'remove', path: '/missing' },
          ];
          expect(() => applyPatch(source, [first, ...failing])).toThrow(
            expect.objectContaining({ name: 'JSONPatch' }),
          );
          expect(() =>
            applyPatch(source, [
              nestedFirst,
              ...failing.map((patch) => ({
                ...patch,
                path: '/target' + patch.path,
              })),
            ]),
          ).toThrow(expect.objectContaining({ name: 'JSONPatch' }));
          expect(JSON.stringify(source)).toBe(snapshot);
        }
      }
    }
  });

  it('reserved-key writes and root-targeting moves protect the borrowed root', () => {
    for (const op of ['add', 'replace', 'move'] as const) {
      const value = freeze({
        ['__proto__']: { count: 1 },
        child: { count: 1 },
      });
      const source = freeze({ donor: value, target: null });
      const root: Parameters<typeof applyPatch>[1][number] =
        op === 'move'
          ? { op, from: '/donor', path: '' }
          : { op, path: '', value };
      const nested = { ...root, path: '/target' };
      for (const key of ['__proto__', 'constructor', 'prototype']) {
        const patch: Parameters<typeof applyPatch>[1][number] = {
          op: 'add',
          path: '/' + key,
          value: freeze({ count: 2 }),
        };
        const expected = applyPatch<{ target: unknown }>(source, [
          nested,
          { ...patch, path: '/target/' + key },
        ]).target;
        expect(applyPatch(source, [root, patch])).toEqual(expected);
      }
      for (const next of ['move', 'copy'] as const) {
        const expected = applyPatch<{ target: unknown }>(source, [
          nested,
          { op: next, from: '/target/child', path: '/target' },
        ]).target;
        expect(
          applyPatch(source, [root, { op: next, from: '/child', path: '' }]),
        ).toEqual(expected);
      }
      expect(value).toEqual({
        ['__proto__']: { count: 1 },
        child: { count: 1 },
      });
    }
  });

  it('discarding an installed root shares the final value like a nested replacement', () => {
    for (const op of ['add', 'replace'] as const) {
      const first = freeze({ discarded: true });
      const last = freeze({ retained: true });
      const nested = applyPatch<{ target: typeof last }>({ target: null }, [
        { op, path: '/target', value: first },
        { op, path: '/target', value: last },
      ]);
      expect(
        applyPatch({}, [
          { op, path: '', value: first },
          { op, path: '', value: last },
        ]),
      ).toBe(nested.target);
      expect(nested.target).toBe(last);
      expect(
        applyPatch({}, [
          { op, path: '', value: first },
          { op: 'remove', path: '' },
        ]),
      ).toBe(null);
    }
  });

  it('read-only root tests and self-moves preserve nested sharing semantics', () => {
    const value = freeze({ child: { count: 1 } });
    for (const op of ['add', 'replace', 'move'] as const) {
      const source = freeze({ donor: value, target: null });
      const root: Parameters<typeof applyPatch>[1][number] =
        op === 'move'
          ? { op, from: '/donor', path: '' }
          : { op, path: '', value };
      const nested = { ...root, path: '/target' };
      const expected = applyPatch<{ target: typeof value }>(source, [
        nested,
        { op: 'test', path: '/target', value },
        { op: 'move', from: '/target', path: '/target' },
      ]).target;
      expect(
        applyPatch(source, [
          root,
          { op: 'test', path: '', value },
          { op: 'move', from: '', path: '' },
        ]),
      ).toBe(expected);
      const copied = applyPatch<{ child: { count: number } }>(source, [
        root,
        { op: 'copy', from: '', path: '' },
      ]);
      expect(copied).toEqual(expected);
      expect(copied.child).not.toBe(value.child);
    }
  });
});
