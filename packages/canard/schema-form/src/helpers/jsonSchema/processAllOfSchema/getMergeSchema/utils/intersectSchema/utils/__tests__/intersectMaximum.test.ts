import { describe, expect, test } from 'vitest';
import { intersectMaximum } from '../intersectMaximum';

describe('intersectMaximum', () => {
  test('더 작은 값을 선택', () => {
    expect(intersectMaximum(5, 10)).toBe(5);
    expect(intersectMaximum(10, 5)).toBe(5);
    expect(intersectMaximum(0, 1)).toBe(0);
    expect(intersectMaximum(-5, -10)).toBe(-10);
  });

  test('같은 값인 경우', () => {
    expect(intersectMaximum(5, 5)).toBe(5);
    expect(intersectMaximum(0, 0)).toBe(0);
    expect(intersectMaximum(-10, -10)).toBe(-10);
  });

  test('base만 있는 경우', () => {
    expect(intersectMaximum(5, undefined)).toBe(5);
    expect(intersectMaximum(0, undefined)).toBe(0);
    expect(intersectMaximum(-10, undefined)).toBe(-10);
  });

  test('source만 있는 경우', () => {
    expect(intersectMaximum(undefined, 10)).toBe(10);
    expect(intersectMaximum(undefined, 0)).toBe(0);
    expect(intersectMaximum(undefined, -5)).toBe(-5);
  });

  test('둘 다 없으면 undefined', () => {
    expect(intersectMaximum(undefined, undefined)).toBeUndefined();
  });

  test('소수점 값들', () => {
    expect(intersectMaximum(1.5, 2.5)).toBe(1.5);
    expect(intersectMaximum(3.14, 2.71)).toBe(2.71);
    expect(intersectMaximum(0.1, 0.01)).toBe(0.01);
  });

  test('0과 음수', () => {
    expect(intersectMaximum(0, -1)).toBe(-1);
    expect(intersectMaximum(-1, 0)).toBe(-1);
    expect(intersectMaximum(-5, -3)).toBe(-5);
  });

  test('매우 큰 숫자들', () => {
    expect(intersectMaximum(Number.MAX_VALUE, 100)).toBe(100);
    expect(intersectMaximum(100, Number.MAX_VALUE)).toBe(100);
  });

  test('매우 작은 숫자들', () => {
    expect(intersectMaximum(Number.MIN_VALUE, 0)).toBe(0);
    expect(intersectMaximum(-Number.MAX_VALUE, -100)).toBe(-Number.MAX_VALUE);
  });

  test('무한대 값들', () => {
    expect(intersectMaximum(Infinity, 100)).toBe(100);
    expect(intersectMaximum(-Infinity, 100)).toBe(-Infinity);
    expect(intersectMaximum(Infinity, -Infinity)).toBe(-Infinity);
  });
});