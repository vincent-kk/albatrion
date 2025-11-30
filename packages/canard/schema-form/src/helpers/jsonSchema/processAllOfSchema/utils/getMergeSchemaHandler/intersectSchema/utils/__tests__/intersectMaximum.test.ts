import { describe, expect, test } from 'vitest';
import { intersectMaximum } from '../intersectMaximum';

describe('intersectMaximum', () => {
  test('selects the smaller value', () => {
    expect(intersectMaximum(5, 10)).toBe(5);
    expect(intersectMaximum(10, 5)).toBe(5);
    expect(intersectMaximum(0, 1)).toBe(0);
    expect(intersectMaximum(-5, -10)).toBe(-10);
  });

  test('when values are equal', () => {
    expect(intersectMaximum(5, 5)).toBe(5);
    expect(intersectMaximum(0, 0)).toBe(0);
    expect(intersectMaximum(-10, -10)).toBe(-10);
  });

  test('when only base exists', () => {
    expect(intersectMaximum(5, undefined)).toBe(5);
    expect(intersectMaximum(0, undefined)).toBe(0);
    expect(intersectMaximum(-10, undefined)).toBe(-10);
  });

  test('when only source exists', () => {
    expect(intersectMaximum(undefined, 10)).toBe(10);
    expect(intersectMaximum(undefined, 0)).toBe(0);
    expect(intersectMaximum(undefined, -5)).toBe(-5);
  });

  test('returns undefined when both are undefined', () => {
    expect(intersectMaximum(undefined, undefined)).toBeUndefined();
  });

  test('decimal values', () => {
    expect(intersectMaximum(1.5, 2.5)).toBe(1.5);
    expect(intersectMaximum(3.14, 2.71)).toBe(2.71);
    expect(intersectMaximum(0.1, 0.01)).toBe(0.01);
  });

  test('zero and negative numbers', () => {
    expect(intersectMaximum(0, -1)).toBe(-1);
    expect(intersectMaximum(-1, 0)).toBe(-1);
    expect(intersectMaximum(-5, -3)).toBe(-5);
  });

  test('very large numbers', () => {
    expect(intersectMaximum(Number.MAX_VALUE, 100)).toBe(100);
    expect(intersectMaximum(100, Number.MAX_VALUE)).toBe(100);
  });

  test('very small numbers', () => {
    expect(intersectMaximum(Number.MIN_VALUE, 0)).toBe(0);
    expect(intersectMaximum(-Number.MAX_VALUE, -100)).toBe(-Number.MAX_VALUE);
  });

  test('infinite values', () => {
    expect(intersectMaximum(Infinity, 100)).toBe(100);
    expect(intersectMaximum(-Infinity, 100)).toBe(-Infinity);
    expect(intersectMaximum(Infinity, -Infinity)).toBe(-Infinity);
  });
});