import { describe, expect, it } from 'vitest';
import { removeUndefined } from '../removeUndefined';
import { sortObjectKeys } from '../sortObjectKeys';

describe('round-2 common-utils 1: own data copies', () => {
  it.each(['__proto__', 'constructor', 'prototype'])('copies %s like an ordinary key', key => {
    const ordinary = { item: { value: 1 }, missing: undefined };
    const reserved = { [key]: { value: 1 }, missing: undefined };
    const left = removeUndefined(ordinary);
    const right = removeUndefined(reserved);
    expect(Object.getPrototypeOf(right)).toBe(Object.getPrototypeOf(left));
    expect(Object.keys(right)).toEqual([key]);
    expect(Object.getOwnPropertyDescriptor(right, key)?.value).toEqual(left.item);
  });
  it.each([true, false])('sorts preferred and remaining own keys (preferred: %s)', preferred => {
    const input = { ['__proto__']: { x: 1 }, a: 2 };
    const result = sortObjectKeys(input, preferred ? ['__proto__'] : ['a']);
    const ordinary = sortObjectKeys({ item: { x: 1 }, a: 2 }, preferred ? ['item'] : ['a']);
    expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(ordinary));
    expect(Object.keys(result).map(key => key === '__proto__' ? 'item' : key)).toEqual(Object.keys(ordinary));
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toEqual(ordinary.item);
  });
  it('preserves nested reserved copies inside arrays', () => {
    const result = removeUndefined([{ ['__proto__']: { x: 1 }, missing: undefined }]);
    expect(Object.getPrototypeOf(result[0])).toBe(Object.prototype);
    expect(Object.keys(result[0])).toEqual(['__proto__']);
  });
});
