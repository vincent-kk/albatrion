import { describe, expect, test } from 'vitest';
import { validateRange } from '../validateRange';

describe('validateRange', () => {
  test('정상 범위는 에러 없음', () => {
    expect(() => validateRange(5, 10)).not.toThrow();
    expect(() => validateRange(0, 100)).not.toThrow();
    expect(() => validateRange(-10, -5)).not.toThrow();
    expect(() => validateRange(-5, 5)).not.toThrow();
  });

  test('같은 값은 유효함', () => {
    expect(() => validateRange(5, 5)).not.toThrow();
    expect(() => validateRange(0, 0)).not.toThrow();
    expect(() => validateRange(-10, -10)).not.toThrow();
  });

  test('min > max면 에러', () => {
    expect(() => validateRange(10, 5)).toThrow('Invalid range: min > max (10 > 5)');
    expect(() => validateRange(1, 0)).toThrow('Invalid range: min > max (1 > 0)');
    expect(() => validateRange(-5, -10)).toThrow('Invalid range: min > max (-5 > -10)');
  });

  test('커스텀 에러 메시지', () => {
    expect(() => validateRange(10, 5, 'Custom error')).toThrow('Custom error (10 > 5)');
    expect(() => validateRange(100, 50, 'Length validation failed')).toThrow(
      'Length validation failed (100 > 50)'
    );
  });

  test('min만 있는 경우 (max는 undefined)', () => {
    expect(() => validateRange(5, undefined)).not.toThrow();
    expect(() => validateRange(-10, undefined)).not.toThrow();
    expect(() => validateRange(0, undefined)).not.toThrow();
  });

  test('max만 있는 경우 (min은 undefined)', () => {
    expect(() => validateRange(undefined, 10)).not.toThrow();
    expect(() => validateRange(undefined, -5)).not.toThrow();
    expect(() => validateRange(undefined, 0)).not.toThrow();
  });

  test('둘 다 undefined인 경우', () => {
    expect(() => validateRange(undefined, undefined)).not.toThrow();
  });

  test('소수점 값들', () => {
    expect(() => validateRange(1.5, 2.5)).not.toThrow();
    expect(() => validateRange(2.5, 1.5)).toThrow('Invalid range: min > max (2.5 > 1.5)');
    expect(() => validateRange(3.14, 3.14)).not.toThrow();
  });

  test('0과 음수 조합', () => {
    expect(() => validateRange(-5, 0)).not.toThrow();
    expect(() => validateRange(0, -5)).toThrow('Invalid range: min > max (0 > -5)');
    expect(() => validateRange(-10, -1)).not.toThrow();
  });

  test('매우 큰 숫자들', () => {
    expect(() => validateRange(100, Number.MAX_VALUE)).not.toThrow();
    expect(() => validateRange(Number.MAX_VALUE, 100)).toThrow(
      `Invalid range: min > max (${Number.MAX_VALUE} > 100)`
    );
  });

  test('무한대 값들', () => {
    expect(() => validateRange(-Infinity, Infinity)).not.toThrow();
    expect(() => validateRange(Infinity, -Infinity)).toThrow(
      'Invalid range: min > max (Infinity > -Infinity)'
    );
    expect(() => validateRange(100, Infinity)).not.toThrow();
    expect(() => validateRange(Infinity, 100)).toThrow(
      'Invalid range: min > max (Infinity > 100)'
    );
  });

  test('다양한 커스텀 메시지들', () => {
    const testCases = [
      ['String length error', 10, 5],
      ['Array size error', 100, 50],
      ['Number range error', 1000, 500]
    ] as const;

    testCases.forEach(([message, min, max]) => {
      expect(() => validateRange(min, max, message)).toThrow(`${message} (${min} > ${max})`);
    });
  });
});