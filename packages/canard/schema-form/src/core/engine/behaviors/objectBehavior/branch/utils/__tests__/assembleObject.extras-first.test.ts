import { expect, it, vi } from 'vitest';

import { objectKeyCounts } from '../../../utils/objectKeyCounts';
import { assembleObject } from '../assembleObject';
import { assembleObjectBaseline } from './fixtures/assembleObject.baseline';

/** Build own extras with integer ordering, prototype spelling and undefined data. */
const extrasWithKeys = (size: number) => {
  const extras: Record<string, unknown> = {};
  Object.defineProperty(extras, '__proto__', {
    value: { retained: true },
    enumerable: true,
  });
  extras['2'] = undefined;
  extras['1'] = { retained: true };
  for (let index = 3; index < size; index++) extras['key' + index] = index;
  return extras;
};

/** Supply the assembler's private record contract without mounting a full tree. */
const makeNode = (
  extras: unknown,
  propertyOrder: string[] = [],
  childEntries: { name: string }[] = [],
) =>
  ({
    local: undefined,
    undeclaredValues: extras,
    schema: {
      schema: { type: 'object', options: { propertyOrder } },
      typeConflict: false,
    },
    blueprintNode: { childEntries },
  }) as unknown as Parameters<typeof assembleObject>[0];

/** Compare values, own descriptors, order, value identities and cached key counts. */
const expectEquivalent = (actual: unknown, baseline: unknown) => {
  expect(actual).toEqual(baseline);
  expect(Object.keys(actual as object)).toEqual(
    Object.keys(baseline as object),
  );
  expect(Object.getPrototypeOf(actual)).toBe(Object.getPrototypeOf(baseline));
  expect(Object.getOwnPropertyDescriptors(actual)).toEqual(
    Object.getOwnPropertyDescriptors(baseline),
  );
  for (const name of Object.keys(baseline as object))
    expect(
      Object.is(
        Reflect.get(actual as object, name),
        Reflect.get(baseline as object, name),
      ),
    ).toBe(true);
  expect(objectKeyCounts.get(actual as object)).toBe(
    objectKeyCounts.get(baseline as object),
  );
};

it.each([3, 1000])(
  'matches the frozen first-composition oracle for %i own keys',
  (size) => {
    const extras = extrasWithKeys(size);
    const node = makeNode(extras);
    const baselineNode = makeNode(extras);
    const actual = assembleObject(node, []);
    const baseline = assembleObjectBaseline(baselineNode, []);
    expectEquivalent(actual, baseline);
    expect(actual).not.toBe(extras);
    expect(Object.keys(actual as object)).toHaveLength(size);
    expect(Object.keys(actual as object).slice(0, 3)).toEqual([
      '1',
      '2',
      '__proto__',
    ]);
  },
);

it.each(['propertyOrder', 'inactive declaration', 'undefined extras'])(
  'preserves the existing %s path',
  (condition) => {
    const extras =
      condition === 'undefined extras' ? undefined : extrasWithKeys(5);
    const preferred =
      condition === 'propertyOrder' ? ['key4', '__proto__'] : [];
    const entries =
      condition === 'inactive declaration' ? [{ name: 'inactive' }] : [];
    expectEquivalent(
      assembleObject(makeNode(extras, preferred, entries), []),
      assembleObjectBaseline(makeNode(extras, preferred, entries), []),
    );
  },
);

it.each([3, 1000])(
  'preserves stable-shape reuse and added-key fallback after %i keys',
  (size) => {
    const extras = extrasWithKeys(size);
    const node = makeNode(extras);
    const baselineNode = makeNode(extras);
    const children: unknown[] = [];
    let actual = assembleObject(node, children);
    let baseline = assembleObjectBaseline(baselineNode, children);
    for (const addKey of [false, true]) {
      if (addKey) extras.added = { retained: true };
      node.local = actual;
      baselineNode.local = baseline;
      const hint = { incremental: false };
      const baselineHint = { incremental: false };
      const next = assembleObject(node, children, [], hint);
      const baselineNext = assembleObjectBaseline(
        baselineNode,
        children,
        [],
        baselineHint,
      );
      expectEquivalent(next, baselineNext);
      expect(hint).toEqual(baselineHint);
      expect(hint.incremental).toBe(true);
      expect(Object.is(next, actual)).toBe(Object.is(baselineNext, baseline));
      const full = assembleObject(node, children);
      const baselineFull = assembleObjectBaseline(baselineNode, children);
      expectEquivalent(full, baselineFull);
      expect(Object.is(full, actual)).toBe(!addKey);
      actual = full;
      baseline = baselineFull;
    }
  },
);

it.each([
  'extras only',
  'propertyOrder',
  'inactive declaration',
  'undefined extras',
])(
  'allocates intermediate collections only for the existing generic path: %s',
  (condition) => {
    const extras = extrasWithKeys(1000);
    const node = makeNode(
      condition === 'undefined extras' ? undefined : extras,
      condition === 'propertyOrder' ? ['key4'] : [],
      condition === 'inactive declaration' ? [{ name: 'inactive' }] : [],
    );
    const NativeMap = Map,
      NativeSet = Set;
    const maps = vi.spyOn(globalThis, 'Map').mockImplementation(function (
      ...args: ConstructorParameters<typeof Map>
    ) {
      return new NativeMap(...args);
    });
    const sets = vi.spyOn(globalThis, 'Set').mockImplementation(function (
      ...args: ConstructorParameters<typeof Set>
    ) {
      return new NativeSet(...args);
    });
    let mapCalls = 0,
      setCalls = 0;
    try {
      assembleObject(node, []);
      mapCalls = maps.mock.calls.length;
      setCalls = sets.mock.calls.length;
    } finally {
      maps.mockRestore();
      sets.mockRestore();
    }
    const expectedCalls =
      condition === 'propertyOrder' || condition === 'inactive declaration'
        ? 1
        : 0;
    expect(mapCalls).toBe(expectedCalls);
    expect(setCalls).toBe(expectedCalls);
  },
);
