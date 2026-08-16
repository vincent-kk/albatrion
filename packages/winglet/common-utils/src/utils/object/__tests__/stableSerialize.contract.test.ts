import { describe, expect, it } from 'vitest';

import { stableSerialize } from '../stableSerialize';

/**
 * stableSerialize 가 캐시 키·omit·원시값 타입에서 지키지 못하던 계약.
 * 일반 동작은 stableSerialize.test.ts 담당.
 */
describe('stableSerialize contract', () => {
  it('should not hand an omitted result back to a call without omit', () => {
    const input = { a: 1, b: 2 };

    const withOmit = stableSerialize(input, ['b']);
    const withoutOmit = stableSerialize(input);

    expect(withoutOmit).not.toBe(withOmit);
    expect(stableSerialize({ a: 1, b: 2 })).toBe(withoutOmit);
  });

  it('should not depend on the order the omitted keys are listed', () => {
    const input = { a: 1, b: 2, c: 3 };

    expect(stableSerialize(input, ['a', 'b'])).toBe(
      stableSerialize({ a: 1, b: 2, c: 3 }, ['b', 'a']),
    );
  });

  it('should always return a string', () => {
    expect(typeof stableSerialize(undefined)).toBe('string');
    expect(typeof stableSerialize(null)).toBe('string');
    expect(typeof stableSerialize(0)).toBe('string');
  });

  it('should not collide across primitive types', () => {
    expect(stableSerialize(1)).not.toBe(stableSerialize('1'));
    expect(stableSerialize(true)).not.toBe(stableSerialize('true'));
    expect(stableSerialize(null)).not.toBe(stableSerialize('null'));
    expect(stableSerialize(undefined)).not.toBe(stableSerialize('undefined'));
  });

  it('should keep objects whose primitives differ only by type apart', () => {
    expect(stableSerialize({ a: 1 })).not.toBe(stableSerialize({ a: '1' }));
  });

  it('should return the same string for the same object on every call', () => {
    const input = { a: 1, nested: { b: 2 } };

    expect(stableSerialize(input)).toBe(stableSerialize(input));
  });
});
