import { describe, expect, it } from 'vitest';

import { EMPTY_ARRAY } from '../array';
import { EMPTY_OBJECT } from '../object';

// filid:contract shared-empty-values
describe('shared empty values', () => {
  it('provides a frozen empty array assignable to readonly element arrays', () => {
    const strings: readonly string[] = EMPTY_ARRAY;
    const records: readonly { value: number }[] = EMPTY_ARRAY;
    expect(strings).toBe(EMPTY_ARRAY);
    expect(records).toBe(EMPTY_ARRAY);
    expect(EMPTY_ARRAY).toEqual([]);
    expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
  });

  it('provides a frozen object without own keys', () => {
    expect(Reflect.ownKeys(EMPTY_OBJECT)).toEqual([]);
    expect(Object.isFrozen(EMPTY_OBJECT)).toBe(true);
  });

  it('preserves each reference across repeated imports', async () => {
    const firstArray = await import('../array');
    const secondArray = await import('../array');
    const firstObject = await import('../object');
    const secondObject = await import('../object');
    expect(firstArray.EMPTY_ARRAY).toBe(EMPTY_ARRAY);
    expect(secondArray.EMPTY_ARRAY).toBe(EMPTY_ARRAY);
    expect(firstObject.EMPTY_OBJECT).toBe(EMPTY_OBJECT);
    expect(secondObject.EMPTY_OBJECT).toBe(EMPTY_OBJECT);
  });
});
