import { describe, expect, it } from 'vitest';

import { gcd } from '../gcd';

describe('gcd', () => {
  it('두 양수의 최대공약수를 계산해야 합니다', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(48, 18)).toBe(6);
    expect(gcd(17, 19)).toBe(1); // 서로소
    expect(gcd(100, 50)).toBe(50);
  });

  it('음수가 포함된 경우도 올바르게 처리해야 합니다', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });

  it('하나가 0일 때 다른 수의 절대값을 반환해야 합니다', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
    expect(gcd(0, -5)).toBe(5);
    expect(gcd(-5, 0)).toBe(5);
  });

  it('두 수가 모두 0일 때 0을 반환해야 합니다', () => {
    expect(gcd(0, 0)).toBe(0);
  });

  it('같은 수의 최대공약수는 그 수의 절대값이어야 합니다', () => {
    expect(gcd(7, 7)).toBe(7);
    expect(gcd(-7, -7)).toBe(7);
  });

  it('큰 수들도 올바르게 처리해야 합니다', () => {
    expect(gcd(1071, 462)).toBe(21);
    expect(gcd(2468, 1234)).toBe(1234);
  });

  it('소수(decimal)가 입력된 경우의 동작을 테스트합니다', () => {
    // 소수 입력 시 현재 동작 확인
    expect(gcd(4.5, 6)).toBe(1.5);
    expect(gcd(3.2, 4.8)).toBe(1.6);
    expect(gcd(2.4, 3.6)).toBe(1.2);
    expect(gcd(1.5, 2.5)).toBe(0.5);
    
    // 하나만 소수인 경우
    expect(gcd(4, 6.5)).toBe(0.5);
    expect(gcd(7.5, 15)).toBe(7.5);
    
    // 아주 작은 소수
    expect(gcd(0.2, 0.3)).toBe(0.1);
    expect(gcd(0.6, 0.4)).toBe(0.2);
  });
});