import { describe, expect, it } from 'vitest';
import { getLoadValue } from '../utils/loadValues/getLoadValue';
import { setLoadValue } from '../utils/loadValues/setLoadValue';

describe('load snapshot own properties', () => {
  it.each(['constructor', 'toString', '__proto__'])('does not read inherited %s', (key) => {
    expect(getLoadValue({}, '/' + key)).toBeUndefined();
    expect(getLoadValue({}, '/' + key + '/nested')).toBeUndefined();
  });
  it('writes reserved paths as immutable own data', () => {
    const source = {};
    const value: unknown[] = [];
    const result = setLoadValue(source, '/__proto__/items', value);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toEqual({ items: value });
    expect(getLoadValue(result, '/__proto__/items')).toBe(value);
    expect(source).toEqual({});
    expect(Object.getOwnPropertyDescriptor(Object.prototype, 'items')).toBeUndefined();
  });
});

it('never uses an arbitrary inherited key as a load ancestor', () => {
  const inherited = { nested: { value: 1 } };
  const snapshot: object = Object.create(inherited);
  expect(getLoadValue(snapshot, '/nested/value')).toBeUndefined();
  const result = setLoadValue(snapshot, '/nested/value', 2);
  expect(getLoadValue(result, '/nested/value')).toBe(2);
  expect(inherited.nested.value).toBe(1);
});
