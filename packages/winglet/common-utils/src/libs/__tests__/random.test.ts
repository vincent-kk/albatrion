import { describe, expect, it } from 'vitest';

import { getRandomBoolean, getRandomNumber, getRandomString } from '../random';

describe('getRandomString', () => {
  it('should return a string', () => {
    expect(typeof getRandomString()).toBe('string');
  });

  it('should return a string with specified radix', () => {
    const result = getRandomString(16);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it('should return different strings on multiple calls', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(getRandomString());
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getRandomNumber', () => {
  it('should return a number within the specified range', () => {
    const min = 1;
    const max = 10;
    const result = getRandomNumber(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should handle negative numbers', () => {
    const min = -10;
    const max = -1;
    const result = getRandomNumber(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should handle same min and max values', () => {
    const value = 5;
    expect(getRandomNumber(value, value)).toBe(value);
  });
});

describe('getRandomBoolean', () => {
  it('should return a boolean value', () => {
    expect(typeof getRandomBoolean()).toBe('boolean');
  });

  it('should return both true and false values', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(getRandomBoolean());
    }
    expect(results.size).toBe(2);
    expect(results.has(true)).toBe(true);
    expect(results.has(false)).toBe(true);
  });

  it('should have roughly equal distribution', () => {
    let trueCount = 0;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      if (getRandomBoolean()) trueCount++;
    }

    // Allow for some variance (between 40% and 60%)
    expect(trueCount).toBeGreaterThan(iterations * 0.4);
    expect(trueCount).toBeLessThan(iterations * 0.6);
  });
});
