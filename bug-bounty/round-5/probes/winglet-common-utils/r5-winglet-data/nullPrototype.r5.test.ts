import { describe, expect, it } from 'vitest';

import { clone, cloneLite, merge, removeUndefined, shallowClone, sortObjectKeys } from '@/common-utils';

const dictionary = () => Object.assign(Object.create(null), { b: 2, a: 1 }) as Record<string, number>;
const prototypeName = (value: object) =>
  Object.getPrototypeOf(value) === null ? 'null' : Object.getPrototypeOf(value) === Object.prototype ? 'Object.prototype' : 'other';

describe('prototype-free dictionaries through sibling copy functions (RG1 of round 4 item 6)', () => {
  it('control: the round 4 fix keeps the null prototype in shallowClone, removeUndefined, clone and cloneLite', () => {
    expect([shallowClone, removeUndefined, clone, cloneLite].map((copy) => prototypeName(copy(dictionary())))).toEqual([
      'null', 'null', 'null', 'null',
    ]);
  });

  it('sortObjectKeys keeps the null prototype of a prototype-free dictionary', () => {
    const sorted = sortObjectKeys(dictionary(), ['a', 'b']);
    expect({ prototype: prototypeName(sorted), constructorLookup: typeof (sorted as Record<string, unknown>).constructor }).toEqual({
      prototype: 'null',
      constructorLookup: 'undefined',
    });
  });

  it('control (rejected hypothesis): merge copies a nested prototype-free source the way lodash merge does', async () => {
    const { default: lodashMerge } = await import('lodash/merge.js');
    const reference = lodashMerge({} as Record<string, unknown>, { users: dictionary() });
    const merged = merge({} as Record<string, unknown>, { users: dictionary() });
    expect(prototypeName(merged.users as object)).toBe(prototypeName(reference.users as object));
  });
});
