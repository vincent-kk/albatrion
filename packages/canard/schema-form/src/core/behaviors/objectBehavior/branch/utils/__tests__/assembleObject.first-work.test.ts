import { expect, it, vi } from 'vitest';

import { objectKeyCounts } from '../../../utils/objectKeyCounts';
import { assembleObject } from '../assembleObject';

it('assembles aligned first children without Map or Set allocation and preserves omitted/prototype keys', () => {
  const children = [{ name: 'first', emit: 1 }, { name: 'empty', emit: undefined }, { name: '__proto__', emit: 2 }];
  const node = {
    local: undefined, extras: undefined,
    schema: { schema: { type: 'object' }, typeConflict: false },
    blueprintNode: { childEntries: children.map(child => ({ name: child.name })) },
  } as unknown as Parameters<typeof assembleObject>[0];
  const NativeMap = Map, NativeSet = Set;
  const maps = vi.spyOn(globalThis, 'Map').mockImplementation(function (...args: ConstructorParameters<typeof Map>) {
    return new NativeMap(...args);
  });
  const sets = vi.spyOn(globalThis, 'Set').mockImplementation(function (...args: ConstructorParameters<typeof Set>) {
    return new NativeSet(...args);
  });
  let result;
  let mapCalls = 0, setCalls = 0;
  try {
    result = assembleObject(node, children);
    mapCalls = maps.mock.calls.length;
    setCalls = sets.mock.calls.length;
  } finally {
    maps.mockRestore();
    sets.mockRestore();
  }
  expect(mapCalls).toBe(0);
  expect(setCalls).toBe(0);
  expect(Object.keys(result as object)).toEqual(['first', '__proto__']);
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect((result as Record<string, unknown>).__proto__).toBe(2);
  expect(objectKeyCounts.get(result as object)).toBe(2);
  node.local = result;
  expect(assembleObject(node, children)).toBe(result);
});

it('keeps declaration/preferred/extras order when first-child order needs the generic assembly', () => {
  const children = [{ name: 'second', emit: 2 }, { name: 'first', emit: 1 }];
  const node = {
    local: undefined, extras: { extra: 3 },
    schema: { schema: { type: 'object', options: { propertyKeys: ['extra', 'second'] } }, typeConflict: false },
    blueprintNode: { childEntries: [{ name: 'first' }, { name: 'second' }] },
  } as unknown as Parameters<typeof assembleObject>[0];
  expect(Object.keys(assembleObject(node, children) as object)).toEqual(['extra', 'second', 'first']);
  node.extras = undefined;
  node.schema = { schema: { type: 'object' }, typeConflict: false };
  expect(Object.keys(assembleObject(node, children) as object)).toEqual(['first', 'second']);
});
