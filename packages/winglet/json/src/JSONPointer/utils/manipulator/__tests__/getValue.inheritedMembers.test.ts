import { describe, expect, it } from 'vitest';

import { getValue } from '../getValue';

describe('getValue member resolution', () => {
  it('reads only the document’s own object members', () => {
    expect(getValue({}, '/toString')).toBeUndefined();
    const child: object = Object.create({ inherited: { leaf: 1 } });
    expect(getValue({ child }, '/child/inherited/leaf')).toBeUndefined();
    expect(getValue({ toString: 1 }, '/toString')).toBe(1);
  });

  it('reads only canonical array element keys', () => {
    const a = Object.assign([1], { '01': 2, '4294967295': 3 });
    expect(getValue({ a }, '/a/length')).toBeUndefined();
    expect(getValue({ a }, '#/a/%30%31')).toBeUndefined();
    expect(getValue({ a }, ['a', '4294967295'])).toBeUndefined();
    expect(getValue({ a }, ['a', 0])).toBe(1);
  });

  it.each([
    [{}, '/constructor'],
    [{}, '/__proto__'],
    [{ a: [1, 2] }, '/a/01'],
    [{ a: 1 }, '/missing'],
    [{ a: 1 }, '/missing/deeper'],
  ])('resolves %j at %s to undefined without throwing', (value, pointer) => {
    expect(getValue(value, pointer)).toBeUndefined();
  });
});
