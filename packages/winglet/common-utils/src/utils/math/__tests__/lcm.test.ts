import { describe, expect, it } from 'vitest';

import { lcm } from '../lcm';

describe('lcm', () => {
  it('두 양수의 최소공배수를 계산해야 합니다', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
    expect(lcm(12, 8)).toBe(24);
    expect(lcm(7, 14)).toBe(14);
  });

  it('음수가 포함된 경우도 올바르게 처리해야 합니다', () => {
    expect(lcm(-4, 6)).toBe(12);
    expect(lcm(4, -6)).toBe(12);
    expect(lcm(-4, -6)).toBe(12);
  });

  it('하나가 0일 때 0을 반환해야 합니다', () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
    expect(lcm(0, 0)).toBe(0);
  });

  it('서로소의 최소공배수는 두 수의 곱의 절대값이어야 합니다', () => {
    expect(lcm(7, 11)).toBe(77);
    expect(lcm(13, 17)).toBe(221);
  });

  it('같은 수의 최소공배수는 그 수의 절대값이어야 합니다', () => {
    expect(lcm(5, 5)).toBe(5);
    expect(lcm(-5, -5)).toBe(5);
  });

  it('큰 수들도 올바르게 처리해야 합니다', () => {
    expect(lcm(12, 18)).toBe(36);
    expect(lcm(15, 25)).toBe(75);
    expect(lcm(100, 150)).toBe(300);
  });

  it('소수(decimal)가 입력된 경우의 동작을 테스트합니다', () => {
    // 소수 입력 시 현재 동작 확인
    expect(lcm(1.5, 2.5)).toBe(7.5);
    expect(lcm(2.4, 3.6)).toBe(7.2);
    expect(lcm(4.5, 6)).toBe(18);
    expect(lcm(3.2, 4.8)).toBe(9.6);

    // 하나만 소수인 경우
    expect(lcm(4, 6.5)).toBe(52);
    expect(lcm(7.5, 15)).toBe(15);

    // 아주 작은 소수
    expect(lcm(0.2, 0.3)).toBe(0.6);
    expect(lcm(0.4, 0.6)).toBe(1.2);

    // 소수점 정밀도 문제가 발생할 수 있는 경우
    expect(lcm(0.1, 0.2)).toBe(0.2);
    expect(lcm(0.3, 0.7)).toBe(2.1);
  });
});
