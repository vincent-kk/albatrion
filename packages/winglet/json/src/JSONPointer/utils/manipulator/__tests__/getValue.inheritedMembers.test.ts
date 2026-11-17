import { describe, expect, it } from 'vitest';

import { getValue } from '../getValue';

// Pins the documented read semantics (manipulator DETAIL, SPECIFICATION getValue): ordinary
// keys have no own-property check, reserved names are own-only, and a miss is undefined.
describe('getValue member resolution', () => {
  it('reads inherited members through ordinary keys', () => {
    expect(getValue({}, '/toString')).toBe(Object.prototype.toString);
    expect(getValue({ a: [1] }, '/a/length')).toBe(1);
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
