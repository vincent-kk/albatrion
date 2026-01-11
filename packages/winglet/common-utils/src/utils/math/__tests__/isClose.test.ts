import { describe, expect, it } from 'vitest';

import { isClose } from '../isClose';

describe('isClose', () => {
  it('정확히 같은 값은 true를 반환해야 합니다', () => {
    expect(isClose(1, 1)).toBe(true);
    expect(isClose(0, 0)).toBe(true);
    expect(isClose(-5, -5)).toBe(true);
    expect(isClose(1e10, 1e10)).toBe(true);
    expect(isClose(1e-10, 1e-10)).toBe(true);
  });

  it('부동소수점 오차를 허용해야 합니다', () => {
    expect(isClose(0.1 + 0.2, 0.3)).toBe(true);
    expect(isClose(0.7 + 0.1, 0.8)).toBe(true);
    expect(isClose(1.0 - 0.9 - 0.1, 0)).toBe(true);
  });

  it('허용 오차 내의 차이는 같은 것으로 처리해야 합니다', () => {
    expect(isClose(1, 1 + 1e-9)).toBe(true);
    expect(isClose(1, 1 + 5e-9)).toBe(true); // epsilon(1e-8)보다 작은 차이
    expect(isClose(1e10, 1e10 + 50)).toBe(true); // 상대 오차: 50/1e10 = 5e-9 < 1e-8
  });

  it('허용 오차를 초과하는 차이는 다른 것으로 처리해야 합니다', () => {
    expect(isClose(1, 1.001)).toBe(false);
    expect(isClose(0, 1e-7)).toBe(false);
    expect(isClose(100, 101)).toBe(false);
  });

  it('0 근처에서 절대 오차를 적용해야 합니다', () => {
    expect(isClose(0, 1e-9)).toBe(true);
    expect(isClose(0, -1e-9)).toBe(true);
    expect(isClose(1e-12, 2e-12)).toBe(true);
    expect(isClose(0, 1e-7)).toBe(false);
  });

  it('음수도 올바르게 처리해야 합니다', () => {
    expect(isClose(-1, -1)).toBe(true);
    expect(isClose(-0.1 - 0.2, -0.3)).toBe(true);
    expect(isClose(-1e10, -1e10 - 1)).toBe(true);
    expect(isClose(-1, 1)).toBe(false);
  });

  it('+0과 -0은 같은 것으로 처리해야 합니다', () => {
    expect(isClose(0, -0)).toBe(true);
    expect(isClose(-0, 0)).toBe(true);
  });

  it('NaN은 서로 같은 것으로 처리해야 합니다', () => {
    expect(isClose(NaN, NaN)).toBe(true);
    expect(isClose(NaN, 0)).toBe(false);
    expect(isClose(0, NaN)).toBe(false);
    expect(isClose(NaN, Infinity)).toBe(false);
  });

  it('Infinity를 올바르게 처리해야 합니다', () => {
    expect(isClose(Infinity, Infinity)).toBe(true);
    expect(isClose(-Infinity, -Infinity)).toBe(true);
    expect(isClose(Infinity, -Infinity)).toBe(false);
    expect(isClose(Infinity, 1e308)).toBe(false);
    expect(isClose(-Infinity, -1e308)).toBe(false);
  });

  it('커스텀 epsilon을 사용할 수 있어야 합니다', () => {
    // 더 엄격한 비교
    expect(isClose(1, 1.0001, 1e-5)).toBe(false);
    expect(isClose(1, 1.000001, 1e-5)).toBe(true);

    // 더 느슨한 비교
    expect(isClose(1, 1.01, 0.1)).toBe(true);
    expect(isClose(1, 1.2, 0.1)).toBe(false);

    // Number.EPSILON 사용
    expect(isClose(1, 1 + Number.EPSILON, Number.EPSILON)).toBe(true);
    expect(isClose(1, 1 + Number.EPSILON * 10, Number.EPSILON)).toBe(false);
  });

  it('큰 숫자에서 상대 오차가 적용되어야 합니다', () => {
    const large = 1e15;
    // 상대 오차 1e-8 기준, 1e15 * 1e-8 = 1e7 까지 허용
    expect(isClose(large, large + 1e6)).toBe(true);
    expect(isClose(large, large + 1e8)).toBe(false);
  });

  it('수렴 감지에 사용될 수 있어야 합니다', () => {
    // 기하급수적 수렴 시뮬레이션: a_n = 10 * (1 - 0.5^n)
    let value = 0;
    let iterations = 0;

    while (!isClose(value, 10)) {
      value = (value + 10) / 2;
      iterations++;
      if (iterations > 100) break; // 안전장치
    }

    // 기본 epsilon(1e-8)으로 약 27회 내에 수렴
    expect(iterations).toBeLessThan(30);
    expect(isClose(value, 10)).toBe(true);
  });
});
