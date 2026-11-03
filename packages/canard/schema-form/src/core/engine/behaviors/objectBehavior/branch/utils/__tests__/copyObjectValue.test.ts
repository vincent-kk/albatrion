import { describe, expect, it } from 'vitest';

import { copyObjectValue } from '../copyObjectValue';

const keyedObject = (count: number) => {
  const source: Record<string, number> = {};
  for (let index = 0; index < count; index++) source['key' + index] = index;
  return source;
};

describe('copyObjectValue', () => {
  it('keeps own keys, their order and values, numeric keys included', () => {
    const nested = { inner: true };
    const source = { b: 1, a: nested, 2: 'two', 1: 'one', z: undefined };
    const copy = copyObjectValue(source, Object.keys(source).length);
    expect(copy).not.toBe(source);
    expect(Object.keys(copy)).toEqual(Object.keys(source));
    expect(copy).toEqual(source);
    expect(copy.a).toBe(nested);
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
  });

  it('keeps an own __proto__ key as a data property', () => {
    const marker = { polluted: true };
    const source = JSON.parse('{"before":1,"__proto__":{"polluted":true},"after":2}');
    const copy = copyObjectValue(source, 3);
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
    expect(Object.keys(copy)).toEqual(['before', '__proto__', 'after']);
    expect(Object.getOwnPropertyDescriptor(copy, '__proto__')?.value).toEqual(marker);
    expect(Reflect.get(copy, 'polluted')).toBeUndefined();
  });

  it('returns the same keys, order and values above the fast-property limit', () => {
    const source = keyedObject(1021);
    const copy = copyObjectValue(source, 1021);
    expect(copy).not.toBe(source);
    expect(Object.keys(copy)).toEqual(Object.keys(source));
    expect(copy).toEqual(source);
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
  });
});
