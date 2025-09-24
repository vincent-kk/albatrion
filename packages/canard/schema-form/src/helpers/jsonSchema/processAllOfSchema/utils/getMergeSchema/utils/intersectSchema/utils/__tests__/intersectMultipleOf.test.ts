import { describe, expect, test } from 'vitest';
import { intersectMultipleOf } from '../intersectMultipleOf';

describe('intersectMultipleOf', () => {
  test('두 배수의 최소공배수', () => {
    expect(intersectMultipleOf(2, 3)).toBe(6);
    expect(intersectMultipleOf(4, 6)).toBe(12);
    expect(intersectMultipleOf(5, 7)).toBe(35);
  });

  test('같은 배수인 경우', () => {
    expect(intersectMultipleOf(5, 5)).toBe(5);
    expect(intersectMultipleOf(10, 10)).toBe(10);
    expect(intersectMultipleOf(1, 1)).toBe(1);
  });

  test('하나가 다른 하나의 배수인 경우', () => {
    expect(intersectMultipleOf(3, 6)).toBe(6);
    expect(intersectMultipleOf(6, 3)).toBe(6);
    expect(intersectMultipleOf(2, 8)).toBe(8);
    expect(intersectMultipleOf(4, 2)).toBe(4);
  });

  test('base만 있는 경우', () => {
    expect(intersectMultipleOf(5, undefined)).toBe(5);
    expect(intersectMultipleOf(10, undefined)).toBe(10);
    expect(intersectMultipleOf(1, undefined)).toBe(1);
  });

  test('source만 있는 경우', () => {
    expect(intersectMultipleOf(undefined, 7)).toBe(7);
    expect(intersectMultipleOf(undefined, 3)).toBe(3);
    expect(intersectMultipleOf(undefined, 1)).toBe(1);
  });

  test('둘 다 없으면 undefined', () => {
    expect(intersectMultipleOf(undefined, undefined)).toBeUndefined();
  });

  test('1과의 최소공배수', () => {
    expect(intersectMultipleOf(1, 5)).toBe(5);
    expect(intersectMultipleOf(10, 1)).toBe(10);
    expect(intersectMultipleOf(1, 1)).toBe(1);
  });

  test('서로소인 경우', () => {
    expect(intersectMultipleOf(3, 5)).toBe(15);
    expect(intersectMultipleOf(7, 11)).toBe(77);
    expect(intersectMultipleOf(4, 9)).toBe(36);
  });

  test('소수점 배수들', () => {
    expect(intersectMultipleOf(0.1, 0.2)).toBeCloseTo(0.2);
    expect(intersectMultipleOf(0.5, 0.3)).toBeCloseTo(1.5);
    expect(intersectMultipleOf(1.5, 2.5)).toBeCloseTo(7.5);
  });

  test('큰 수들의 multipleOf', () => {
    expect(intersectMultipleOf(100, 150)).toBe(300);
    expect(intersectMultipleOf(24, 36)).toBe(72);
    expect(intersectMultipleOf(120, 80)).toBe(240);
  });

  test('실제 JSON Schema 사용 사례', () => {
    // 2의 배수이면서 3의 배수 → 6의 배수
    expect(intersectMultipleOf(2, 3)).toBe(6);

    // 5의 배수이면서 10의 배수 → 10의 배수
    expect(intersectMultipleOf(5, 10)).toBe(10);

    // 0.01의 배수(소수점 둘째자리)이면서 0.1의 배수(소수점 첫째자리) → 0.1의 배수
    expect(intersectMultipleOf(0.01, 0.1)).toBeCloseTo(0.1);
  });

  test('매우 작은 소수점들', () => {
    expect(intersectMultipleOf(0.01, 0.02)).toBeCloseTo(0.02);
    expect(intersectMultipleOf(0.25, 0.5)).toBeCloseTo(0.5);
    expect(intersectMultipleOf(0.1, 0.3)).toBeCloseTo(0.3);
  });

  test('연속적인 정수들', () => {
    expect(intersectMultipleOf(6, 8)).toBe(24);
    expect(intersectMultipleOf(9, 12)).toBe(36);
    expect(intersectMultipleOf(15, 20)).toBe(60);
  });

  test('완전제곱수들', () => {
    expect(intersectMultipleOf(4, 9)).toBe(36); // 2² × 3² = 36
    expect(intersectMultipleOf(16, 25)).toBe(400); // 4² × 5² = 400
  });

  test('0과의 처리는 lcm 함수에 위임', () => {
    // lcm(0, x) = 0이므로
    expect(intersectMultipleOf(0, 5)).toBe(0);
    expect(intersectMultipleOf(7, 0)).toBe(0);
    expect(intersectMultipleOf(0, 0)).toBe(0);
  });
});