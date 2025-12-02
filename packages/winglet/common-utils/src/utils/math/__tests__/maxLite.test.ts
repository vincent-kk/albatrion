import { describe, expect, it } from 'vitest';

import { maxLite } from '../maxLite';

describe('maxLite', () => {
  it('두 양수 중 큰 값을 반환해야 합니다', () => {
    expect(maxLite(5, 10)).toBe(10);
    expect(maxLite(10, 5)).toBe(10);
    expect(maxLite(3, 7)).toBe(7);
    expect(maxLite(100, 50)).toBe(100);
  });

  it('두 음수 중 큰 값을 반환해야 합니다', () => {
    expect(maxLite(-5, -10)).toBe(-5);
    expect(maxLite(-10, -5)).toBe(-5);
    expect(maxLite(-3, -7)).toBe(-3);
    expect(maxLite(-100, -50)).toBe(-50);
  });

  it('양수와 음수를 비교할 때 양수를 반환해야 합니다', () => {
    expect(maxLite(5, -3)).toBe(5);
    expect(maxLite(-3, 5)).toBe(5);
    expect(maxLite(100, -1)).toBe(100);
    expect(maxLite(-1, 100)).toBe(100);
  });

  it('같은 값일 때는 그 값을 반환해야 합니다', () => {
    expect(maxLite(5, 5)).toBe(5);
    expect(maxLite(-5, -5)).toBe(-5);
    expect(maxLite(0, 0)).toBe(0);
  });

  it('0과 다른 수를 비교해야 합니다', () => {
    expect(maxLite(0, 5)).toBe(5);
    expect(maxLite(5, 0)).toBe(5);
    expect(maxLite(0, -5)).toBe(0);
    expect(maxLite(-5, 0)).toBe(0);
  });

  it('소수점 숫자들도 올바르게 비교해야 합니다', () => {
    expect(maxLite(1.5, 2.5)).toBe(2.5);
    expect(maxLite(2.5, 1.5)).toBe(2.5);
    expect(maxLite(-1.5, -2.5)).toBe(-1.5);
    expect(maxLite(0.1, 0.2)).toBe(0.2);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(maxLite(Infinity, 100)).toBe(Infinity);
    expect(maxLite(100, Infinity)).toBe(Infinity);
    expect(maxLite(-Infinity, 100)).toBe(100);
    expect(maxLite(100, -Infinity)).toBe(100);
    expect(maxLite(Infinity, -Infinity)).toBe(Infinity);
  });

  it('NaN과의 비교는 두 번째 값을 반환해야 합니다', () => {
    expect(maxLite(NaN, 5)).toBe(5); // NaN > 5는 false이므로 5 반환
    expect(maxLite(5, NaN)).toBeNaN(); // 5 > NaN는 false이므로 NaN 반환
    expect(maxLite(NaN, NaN)).toBeNaN(); // NaN > NaN는 false이므로 NaN 반환
  });
});
