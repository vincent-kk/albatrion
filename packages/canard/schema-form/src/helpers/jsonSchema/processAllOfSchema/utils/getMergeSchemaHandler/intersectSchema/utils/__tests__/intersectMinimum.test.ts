import { describe, expect, test } from 'vitest';
import { intersectMinimum } from '../intersectMinimum';

describe('intersectMinimum', () => {
  test('selects the larger value', () => {
    expect(intersectMinimum(5, 10)).toBe(10);
    expect(intersectMinimum(10, 5)).toBe(10);
    expect(intersectMinimum(0, 1)).toBe(1);
    expect(intersectMinimum(-5, -10)).toBe(-5);
  });

  test('when values are equal', () => {
    expect(intersectMinimum(5, 5)).toBe(5);
    expect(intersectMinimum(0, 0)).toBe(0);
    expect(intersectMinimum(-10, -10)).toBe(-10);
  });

  test('when only base exists', () => {
    expect(intersectMinimum(5, undefined)).toBe(5);
    expect(intersectMinimum(0, undefined)).toBe(0);
    expect(intersectMinimum(-10, undefined)).toBe(-10);
  });

  test('when only source exists', () => {
    expect(intersectMinimum(undefined, 10)).toBe(10);
    expect(intersectMinimum(undefined, 0)).toBe(0);
    expect(intersectMinimum(undefined, -5)).toBe(-5);
  });

  test('returns undefined when both are undefined', () => {
    expect(intersectMinimum(undefined, undefined)).toBeUndefined();
  });

  test('decimal values', () => {
    expect(intersectMinimum(1.5, 2.5)).toBe(2.5);
    expect(intersectMinimum(3.14, 2.71)).toBe(3.14);
    expect(intersectMinimum(0.1, 0.01)).toBe(0.1);
  });

  test('zero and negative numbers', () => {
    expect(intersectMinimum(0, -1)).toBe(0);
    expect(intersectMinimum(-1, 0)).toBe(0);
    expect(intersectMinimum(-5, -3)).toBe(-3);
  });

  test('very large numbers', () => {
    expect(intersectMinimum(Number.MAX_VALUE, 100)).toBe(Number.MAX_VALUE);
    expect(intersectMinimum(100, Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
  });

  test('very small numbers', () => {
    expect(intersectMinimum(Number.MIN_VALUE, 0)).toBe(Number.MIN_VALUE);
    expect(intersectMinimum(-Number.MAX_VALUE, -100)).toBe(-100);
  });

  test('infinite values', () => {
    expect(intersectMinimum(Infinity, 100)).toBe(Infinity);
    expect(intersectMinimum(-Infinity, 100)).toBe(100);
    expect(intersectMinimum(Infinity, -Infinity)).toBe(Infinity);
  });
});