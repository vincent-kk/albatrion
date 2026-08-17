import { describe, expect, it } from 'vitest';

import { isPlainObject } from '../../filter/isPlainObject';
import { cloneLite } from '../cloneLite';

describe('cloneLite reserved member names', () => {
  it('should preserve every own key of an input with own __proto__ (RC-4 unit)', () => {
    const source = JSON.parse('{"__proto__":{"x":1},"keep":1}');
    const cloned = cloneLite(source);

    expect(Object.keys(cloned).sort()).toEqual(['__proto__', 'keep'].sort());
    expect(Object.getOwnPropertyDescriptor(cloned, '__proto__')?.value).toEqual(
      {
        x: 1,
      },
    );
    expect(cloned.keep).toBe(1);
  });

  it('should keep the clone prototype identical to the input prototype', () => {
    const source = JSON.parse('{"__proto__":{"x":1}}');
    const cloned = cloneLite(source);

    expect(Object.getPrototypeOf(cloned)).toBe(Object.getPrototypeOf(source));
    expect(Object.getPrototypeOf(cloned)).toBe(Object.prototype);
    expect(isPlainObject(cloned)).toBe(true);
    expect((cloned as Record<string, unknown>).x).toBeUndefined();
  });

  it('should deep clone the own __proto__ value instead of sharing it', () => {
    const source = JSON.parse('{"__proto__":{"x":1}}');
    const cloned = cloneLite(source);

    const sourceValue = Object.getOwnPropertyDescriptor(source, '__proto__')
      ?.value as Record<string, unknown>;
    const clonedValue = Object.getOwnPropertyDescriptor(cloned, '__proto__')
      ?.value as Record<string, unknown>;
    expect(clonedValue).toEqual(sourceValue);
    expect(clonedValue).not.toBe(sourceValue);
  });

  it('should preserve own __proto__ at nested positions', () => {
    const source = JSON.parse('{"p":{"__proto__":{"x":1},"keep":2}}');
    const cloned = cloneLite(source);

    expect(Object.keys(cloned.p).sort()).toEqual(['__proto__', 'keep'].sort());
    expect(Object.getPrototypeOf(cloned.p)).toBe(Object.prototype);
    expect(cloned.p.keep).toBe(2);
  });

  it('should not pollute Object.prototype while cloning', () => {
    cloneLite(JSON.parse('{"__proto__":{"x":1},"constructor":{"y":2}}'));

    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(({} as Record<string, unknown>).y).toBeUndefined();
  });
});
