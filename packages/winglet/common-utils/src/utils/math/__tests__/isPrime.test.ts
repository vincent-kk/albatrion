import { describe, expect, it } from 'vitest';

import { isPrime } from '../isPrime';

describe('isPrime', () => {
  it('소수를 올바르게 판별해야 합니다', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(17)).toBe(true);
    expect(isPrime(19)).toBe(true);
    expect(isPrime(23)).toBe(true);
    expect(isPrime(29)).toBe(true);
  });

  it('합성수를 올바르게 판별해야 합니다', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(8)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(10)).toBe(false);
    expect(isPrime(12)).toBe(false);
    expect(isPrime(14)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(16)).toBe(false);
    expect(isPrime(18)).toBe(false);
  });

  it('1과 0, 음수는 소수가 아니어야 합니다', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-1)).toBe(false);
    expect(isPrime(-2)).toBe(false);
    expect(isPrime(-7)).toBe(false);
  });

  it('큰 소수도 올바르게 판별해야 합니다', () => {
    expect(isPrime(97)).toBe(true);
    expect(isPrime(101)).toBe(true);
    expect(isPrime(103)).toBe(true);
    expect(isPrime(997)).toBe(true);
    expect(isPrime(7919)).toBe(true); // 1000번째 소수
  });

  it('큰 합성수도 올바르게 판별해야 합니다', () => {
    expect(isPrime(100)).toBe(false);
    expect(isPrime(999)).toBe(false);
    expect(isPrime(1000)).toBe(false);
    expect(isPrime(7917)).toBe(false); // 7919 - 2
    expect(isPrime(7921)).toBe(false); // 7919 + 2
  });

  it('소수점 숫자는 소수가 아니어야 합니다', () => {
    expect(isPrime(2.5)).toBe(false);
    expect(isPrime(7.1)).toBe(false);
    expect(isPrime(11.9)).toBe(false);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(isPrime(Infinity)).toBe(false);
    expect(isPrime(-Infinity)).toBe(false);
    expect(isPrime(NaN)).toBe(false);
  });
});
