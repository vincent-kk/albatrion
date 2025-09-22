import { abs } from './abs';
import { maxLite } from './maxLite';

/**
 * 두 수의 최대공약수(Greatest Common Divisor)를 계산합니다.
 * 소수 입력의 경우 적절한 스케일링을 통해 정수로 변환한 후 계산합니다.
 *
 * @param left - 첫 번째 수
 * @param right - 두 번째 수
 * @returns 두 수의 최대공약수
 */
export const gcd = (left: number, right: number): number => {
  if (left === 0 && right === 0) return 0;
  if (left === 0) return abs(right);
  if (right === 0) return abs(left);

  if (Number.isInteger(left) && Number.isInteger(right))
    return uclidGcd(left, right);

  const leftDecimals = left.toString().split('.')[1]?.length || 0;
  const rightDecimals = right.toString().split('.')[1]?.length || 0;

  const maxDecimals = maxLite(leftDecimals, rightDecimals);
  const scale = Math.pow(10, maxDecimals);
  const result =
    uclidGcd(Math.round(left * scale), Math.round(right * scale)) / scale;
  return parseFloat(result.toFixed(maxDecimals));
};

const uclidGcd = (left: number, right: number): number => {
  let temp;
  while (right !== 0) {
    temp = right;
    right = left % right;
    left = temp;
  }
  return abs(left);
};
