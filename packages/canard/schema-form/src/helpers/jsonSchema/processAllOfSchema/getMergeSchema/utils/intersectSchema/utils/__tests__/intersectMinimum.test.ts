import { describe, expect, test } from 'vitest';
import { intersectMinimum } from '../intersectMinimum';

describe('intersectMinimum', () => {
  test('더 큰 값을 선택', () => {
    expect(intersectMinimum(5, 10)).toBe(10);
    expect(intersectMinimum(10, 5)).toBe(10);
    expect(intersectMinimum(0, 1)).toBe(1);
    expect(intersectMinimum(-5, -10)).toBe(-5);
  });

  test('같은 값인 경우', () => {
    expect(intersectMinimum(5, 5)).toBe(5);
    expect(intersectMinimum(0, 0)).toBe(0);
    expect(intersectMinimum(-10, -10)).toBe(-10);
  });

  test('base만 있는 경우', () => {
    expect(intersectMinimum(5, undefined)).toBe(5);
    expect(intersectMinimum(0, undefined)).toBe(0);
    expect(intersectMinimum(-10, undefined)).toBe(-10);
  });

  test('source만 있는 경우', () => {
    expect(intersectMinimum(undefined, 10)).toBe(10);
    expect(intersectMinimum(undefined, 0)).toBe(0);
    expect(intersectMinimum(undefined, -5)).toBe(-5);
  });

  test('둘 다 없으면 undefined', () => {
    expect(intersectMinimum(undefined, undefined)).toBeUndefined();
  });

  test('소수점 값들', () => {
    expect(intersectMinimum(1.5, 2.5)).toBe(2.5);
    expect(intersectMinimum(3.14, 2.71)).toBe(3.14);
    expect(intersectMinimum(0.1, 0.01)).toBe(0.1);
  });

  test('0과 음수', () => {
    expect(intersectMinimum(0, -1)).toBe(0);
    expect(intersectMinimum(-1, 0)).toBe(0);
    expect(intersectMinimum(-5, -3)).toBe(-3);
  });

  test('매우 큰 숫자들', () => {
    expect(intersectMinimum(Number.MAX_VALUE, 100)).toBe(Number.MAX_VALUE);
    expect(intersectMinimum(100, Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
  });

  test('매우 작은 숫자들', () => {
    expect(intersectMinimum(Number.MIN_VALUE, 0)).toBe(Number.MIN_VALUE);
    expect(intersectMinimum(-Number.MAX_VALUE, -100)).toBe(-100);
  });

  test('무한대 값들', () => {
    expect(intersectMinimum(Infinity, 100)).toBe(Infinity);
    expect(intersectMinimum(-Infinity, 100)).toBe(100);
    expect(intersectMinimum(Infinity, -Infinity)).toBe(Infinity);
  });
});