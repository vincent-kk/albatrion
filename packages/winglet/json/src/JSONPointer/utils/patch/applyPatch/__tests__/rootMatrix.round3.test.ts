import { expect, it } from 'vitest';

import type { JSONValue } from '../../../../../type';
import type { Patch } from '../../../patchModel';
import { applyPatch } from '../applyPatch';

/** Freeze the full caller-owned graph so a forbidden write fails at its origin. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
/** Fresh JSON roots include containers and every primitive kind accepted as an operation value. */
const roots = (): JSONValue[] => [
  { child: { count: 1 } },
  [{ count: 1 }],
  null,
  true,
  false,
  0,
  1,
  '',
  'value',
];

it('round-3 json 1: all root operations agree across replacement spellings, root types and modes', () => {
  for (const immutable of [true, false])
    for (const value of roots())
      for (const path of ['', '#'])
        for (const operation of [
          'add',
          'replace',
          'remove',
          'test',
          'copy',
          'move',
        ] as const) {
          const input = freeze({ untouched: { count: 1 } });
          freeze(value);
          const patch: Patch = { op: operation, path, value, from: path };
          const run = (op: 'add' | 'replace') =>
            applyPatch(input, [{ op, path: '', value }, patch], { immutable });
          expect(run('add')).toEqual(run('replace'));
          expect(run('replace')).toEqual(operation === 'remove' ? null : value);
          expect(input).toEqual({ untouched: { count: 1 } });
        }
});

it('round-3 json 1: every depth-one operation after root ownership agrees with a fresh mutable document', () => {
  for (const array of [true, false])
    for (const operation of [
      'add',
      'replace',
      'remove',
      'test',
      'copy',
      'move',
    ] as const) {
      const make = () =>
        array
          ? [{ count: 1 }, { count: 2 }]
          : { item: { count: 1 }, other: { count: 2 } };
      const from = array ? '/0' : '/item';
      const path =
        operation === 'copy' || operation === 'move' || operation === 'add'
          ? array
            ? '/1'
            : '/added'
          : from;
      const patch: Patch = { op: operation, path, from, value: { count: 1 } };
      for (const rootOperation of ['add', 'replace'] as const) {
        const caller = freeze(make());
        const input = freeze({ caller });
        const expected = applyPatch(make(), [patch], { immutable: false });
        expect(
          applyPatch(input, [
            { op: rootOperation, path: '', value: caller },
            patch,
          ]),
        ).toEqual(expected);
        expect(caller).toEqual(make());
        const mutable = make();
        expect(
          applyPatch(
            {},
            [{ op: rootOperation, path: '', value: mutable }, patch],
            { immutable: false },
          ),
        ).toEqual(expected);
      }
    }
});

it('round-3 json 1: copying from the whole root to depth one is finite and preserves frozen aliases', () => {
  for (const value of roots())
    for (const immutable of [true, false]) {
      if (value === null || typeof value !== 'object') continue;
      for (const from of ['', '#']) {
        const caller = structuredClone(value);
        if (immutable) freeze(caller);
        const snapshot = structuredClone(caller);
        const path = Array.isArray(caller) ? '/-' : '/copy';
        const result = applyPatch(
          {},
          [
            { op: 'replace', path: '', value: caller },
            { op: 'copy', from, path },
          ],
          { immutable },
        );
        expect(result).toEqual(
          Array.isArray(snapshot)
            ? [...snapshot, snapshot]
            : { ...snapshot, copy: snapshot },
        );
        if (immutable) expect(caller).toEqual(snapshot);
      }
    }
});
