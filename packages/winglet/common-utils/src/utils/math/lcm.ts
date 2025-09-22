import { abs } from './abs';
import { gcd } from './gcd';
import { maxLite } from './maxLite';

/**
 * 두 수의 최소공배수(Least Common Multiple)를 계산합니다.
 * 소수 입력도 지원하며, 부동소수점 정밀도 문제를 해결합니다.
 *
 * @param left - 첫 번째 수
 * @param right - 두 번째 수
 * @returns 두 수의 최소공배수
 */
export const lcm = (left: number, right: number): number => {
  if (left === 0 || right === 0) return 0;

  const result = abs(left * right) / gcd(left, right);
  if (Number.isInteger(result)) return result;

  const leftDecimals = left.toString().split('.')[1]?.length || 0;
  const rightDecimals = right.toString().split('.')[1]?.length || 0;
  const maxDecimals = maxLite(leftDecimals, rightDecimals);
  return parseFloat(result.toFixed(maxDecimals + 1));
};
