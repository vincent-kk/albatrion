import { describe, expect, test } from 'vitest';
import { intersectMultipleOf } from '../intersectMultipleOf';

describe('intersectMultipleOf', () => {
  test('returns LCM of two multiples', () => {
    expect(intersectMultipleOf(2, 3)).toBe(6);
    expect(intersectMultipleOf(4, 6)).toBe(12);
    expect(intersectMultipleOf(5, 7)).toBe(35);
  });

  test('when multiples are equal', () => {
    expect(intersectMultipleOf(5, 5)).toBe(5);
    expect(intersectMultipleOf(10, 10)).toBe(10);
    expect(intersectMultipleOf(1, 1)).toBe(1);
  });

  test('when one is a multiple of the other', () => {
    expect(intersectMultipleOf(3, 6)).toBe(6);
    expect(intersectMultipleOf(6, 3)).toBe(6);
    expect(intersectMultipleOf(2, 8)).toBe(8);
    expect(intersectMultipleOf(4, 2)).toBe(4);
  });

  test('when only base exists', () => {
    expect(intersectMultipleOf(5, undefined)).toBe(5);
    expect(intersectMultipleOf(10, undefined)).toBe(10);
    expect(intersectMultipleOf(1, undefined)).toBe(1);
  });

  test('when only source exists', () => {
    expect(intersectMultipleOf(undefined, 7)).toBe(7);
    expect(intersectMultipleOf(undefined, 3)).toBe(3);
    expect(intersectMultipleOf(undefined, 1)).toBe(1);
  });

  test('returns undefined when both are undefined', () => {
    expect(intersectMultipleOf(undefined, undefined)).toBeUndefined();
  });

  test('LCM with 1', () => {
    expect(intersectMultipleOf(1, 5)).toBe(5);
    expect(intersectMultipleOf(10, 1)).toBe(10);
    expect(intersectMultipleOf(1, 1)).toBe(1);
  });

  test('coprime numbers', () => {
    expect(intersectMultipleOf(3, 5)).toBe(15);
    expect(intersectMultipleOf(7, 11)).toBe(77);
    expect(intersectMultipleOf(4, 9)).toBe(36);
  });

  test('decimal multiples', () => {
    expect(intersectMultipleOf(0.1, 0.2)).toBeCloseTo(0.2);
    expect(intersectMultipleOf(0.5, 0.3)).toBeCloseTo(1.5);
    expect(intersectMultipleOf(1.5, 2.5)).toBeCloseTo(7.5);
  });

  test('large numbers multipleOf', () => {
    expect(intersectMultipleOf(100, 150)).toBe(300);
    expect(intersectMultipleOf(24, 36)).toBe(72);
    expect(intersectMultipleOf(120, 80)).toBe(240);
  });

  test('real JSON Schema use cases', () => {
    // Multiple of 2 AND multiple of 3 → multiple of 6
    expect(intersectMultipleOf(2, 3)).toBe(6);

    // Multiple of 5 AND multiple of 10 → multiple of 10
    expect(intersectMultipleOf(5, 10)).toBe(10);

    // Multiple of 0.01 (two decimals) AND multiple of 0.1 (one decimal) → multiple of 0.1
    expect(intersectMultipleOf(0.01, 0.1)).toBeCloseTo(0.1);
  });

  test('very small decimals', () => {
    expect(intersectMultipleOf(0.01, 0.02)).toBeCloseTo(0.02);
    expect(intersectMultipleOf(0.25, 0.5)).toBeCloseTo(0.5);
    expect(intersectMultipleOf(0.1, 0.3)).toBeCloseTo(0.3);
  });

  test('consecutive integers', () => {
    expect(intersectMultipleOf(6, 8)).toBe(24);
    expect(intersectMultipleOf(9, 12)).toBe(36);
    expect(intersectMultipleOf(15, 20)).toBe(60);
  });

  test('perfect squares', () => {
    expect(intersectMultipleOf(4, 9)).toBe(36); // 2² × 3² = 36
    expect(intersectMultipleOf(16, 25)).toBe(400); // 4² × 5² = 400
  });

  test('handling of 0 is delegated to lcm function', () => {
    // lcm(0, x) = 0
    expect(intersectMultipleOf(0, 5)).toBe(0);
    expect(intersectMultipleOf(7, 0)).toBe(0);
    expect(intersectMultipleOf(0, 0)).toBe(0);
  });
});