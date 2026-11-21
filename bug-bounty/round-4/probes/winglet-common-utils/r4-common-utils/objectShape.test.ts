import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import {
  clone,
  cloneLite,
  getEmptyObject,
  isTypedArray,
  removeUndefined,
  shallowClone,
} from '@/common-utils';

describe('copies of a prototype-free dictionary stay prototype-free', () => {
  const makeDictionary = () => {
    const dictionary = getEmptyObject<number>();
    dictionary.apple = 1;
    return dictionary;
  };

  it('shallowClone keeps a null prototype like clone and cloneLite do', () => {
    const dictionary = makeDictionary();
    expect({
      clone: Object.getPrototypeOf(clone(dictionary)),
      cloneLite: Object.getPrototypeOf(cloneLite(dictionary)),
      shallowClone: Object.getPrototypeOf(shallowClone(dictionary)),
    }).toEqual({ clone: null, cloneLite: null, shallowClone: null });
  });

  it('a key lookup on the shallow copy finds nothing for an absent "constructor" key', () => {
    const dictionary = makeDictionary();
    expect(dictionary.constructor).toBeUndefined();
    expect(shallowClone(dictionary).constructor).toBeUndefined();
  });

  it('removeUndefined keeps a null prototype', () => {
    const dictionary = makeDictionary();
    expect(Object.getPrototypeOf(removeUndefined(dictionary))).toBeNull();
  });
});

describe('isTypedArray on values from another realm', () => {
  it('a foreign DataView is not a typed array', () => {
    const view = runInNewContext('new DataView(new ArrayBuffer(4))');
    expect(isTypedArray(view)).toBe(false);
  });

  it('control: a local DataView is not a typed array', () => {
    expect(isTypedArray(new DataView(new ArrayBuffer(4)))).toBe(false);
  });

  it('control: a foreign Uint8Array is a typed array', () => {
    expect(isTypedArray(runInNewContext('new Uint8Array(4)'))).toBe(true);
  });
});
