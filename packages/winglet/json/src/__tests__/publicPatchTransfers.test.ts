import { expect, it } from 'vitest';

import { Operation, type Patch, applyPatch } from '../index';

it.each([true, false])(
  'moves after removing and inserts copies (immutable %s)',
  (immutable) => {
    const source = { items: [1, 2, 3] };
    expect(
      applyPatch(
        source,
        [
          { op: Operation.MOVE, from: '/items/0', path: '/items/1' },
          { op: Operation.COPY, from: '/items/0', path: '/items/2' },
        ],
        { immutable },
      ),
    ).toEqual({ items: [2, 1, 2, 3] });
    expect(source.items).toEqual(immutable ? [1, 2, 3] : [2, 1, 2, 3]);
  },
);

it('accepts self-moves and copies into a descendant but rejects moving there', () => {
  const source = { item: { value: 1 } };
  expect(
    applyPatch(source, [{ op: Operation.MOVE, from: '/item', path: '/item' }]),
  ).toEqual(source);
  expect(
    applyPatch(source, [
      { op: Operation.COPY, from: '/item', path: '/item/copy' },
    ]),
  ).toEqual({ item: { value: 1, copy: { value: 1 } } });
  expect(() =>
    applyPatch(source, [
      { op: Operation.MOVE, from: '/item', path: '/item/moved' },
    ]),
  ).toThrow();
});

it.each([undefined, true, false])(
  'tests values independently of strict=%s',
  (strict) => {
    const source = { item: 1 };
    const options = strict === undefined ? {} : { strict };
    expect(() =>
      applyPatch(
        source,
        [{ op: Operation.TEST, path: '/item', value: 2 }],
        options,
      ),
    ).toThrow(expect.objectContaining({ specific: 'PATCH_TEST_FAILED' }));
  },
);

it.each([
  {
    patch: { op: Operation.REPLACE, path: '/missing', value: 2 },
    specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
  },
  {
    patch: { op: Operation.COPY, from: '/missing', path: '/b' },
    specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
  },
  {
    patch: { op: Operation.MOVE, from: '/missing', path: '/b' },
    specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
  },
  {
    patch: { op: Operation.COPY, from: '/items/01', path: '/b' },
    specific: 'PATCH_ARRAY_INDEX_INVALID',
  },
  {
    patch: { op: Operation.COPY, from: '/items/4294967296', path: '/b' },
    specific: 'PATCH_ARRAY_INDEX_INVALID',
  },
] satisfies { patch: Patch; specific: string }[])(
  'reports $specific for $patch',
  ({ patch, specific }) => {
    expect(() => applyPatch({ items: [1] }, [patch])).toThrow(
      expect.objectContaining({ specific }),
    );
  },
);

it('copies explicit undefined and array holes while ignoring inherited members', () => {
  const items = new Array<number>(1);
  Object.setPrototypeOf(
    items,
    Object.assign(Object.create(Array.prototype), { 0: 42 }),
  );
  const source = {
    items,
    own: undefined,
    row: Object.create({ inherited: 42 }),
  };
  const copied = applyPatch(
    source,
    [
      { op: Operation.COPY, from: '/own', path: '/copied' },
      { op: Operation.COPY, from: '/items/0', path: '/hole' },
    ],
    { immutable: false },
  );
  expect(copied).toHaveProperty('copied', undefined);
  expect(copied).toHaveProperty('hole', undefined);
  expect(() =>
    applyPatch(source, [
      { op: Operation.COPY, from: '/row/inherited', path: '/copied' },
    ]),
  ).toThrow(
    expect.objectContaining({ specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND' }),
  );
});

it('exposes earlier mutations and source removal when a mutable move fails', () => {
  const source = { a: 1 };
  expect(() =>
    applyPatch(
      source,
      [
        { op: Operation.ADD, path: '/b', value: 2 },
        { op: Operation.MOVE, from: '/a', path: '/missing/child' },
      ],
      { immutable: false },
    ),
  ).toThrow();
  expect(source).toEqual({ b: 2 });
});

it('resolves the largest array index without wrapping it to the first item', () => {
  const source: { items: string[]; last?: string } = { items: ['first'] };
  source.items[4294967294] = 'last';
  const result = applyPatch(
    source,
    [{ op: Operation.COPY, from: '/items/4294967294', path: '/last' }],
    { immutable: false },
  );
  expect(result.last).toBe('last');
});

it('replaces and moves a non-function value inherited by a mutable object', () => {
  const first = { value: 1 };
  const second = { value: 2 };
  const replaced = Object.setPrototypeOf({}, first);
  const moved = Object.setPrototypeOf({}, second);
  expect(
    applyPatch(
      replaced,
      [{ op: Operation.REPLACE, path: '/value', value: 3 }],
      {
        immutable: false,
      },
    ),
  ).toHaveProperty('value', 3);
  expect(
    applyPatch(moved, [{ op: Operation.MOVE, from: '/value', path: '/own' }], {
      immutable: false,
    }),
  ).toHaveProperty('own', 2);
});
