import { abs } from './abs';
import { maxLite } from './maxLite';

/**
 * Calculates the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
 *
 * Computes the largest positive integer that divides both numbers without remainder.
 * Supports both integers and decimal numbers by scaling decimals to integers with
 * appropriate precision handling. Uses the efficient Euclidean algorithm for computation.
 *
 * @param left - First number (integer or decimal)
 * @param right - Second number (integer or decimal)
 * @returns Greatest common divisor of the two numbers
 *
 * @example
 * Integer GCD calculations:
 * ```typescript
 * import { gcd } from '@winglet/common-utils';
 *
 * console.log(gcd(12, 8)); // 4 (largest number dividing both 12 and 8)
 * console.log(gcd(48, 18)); // 6
 * console.log(gcd(15, 25)); // 5
 * console.log(gcd(17, 13)); // 1 (coprime numbers)
 * console.log(gcd(100, 50)); // 50
 * ```
 *
 * @example
 * Decimal and edge case handling:
 * ```typescript
 * // Decimal numbers (scaled to integers)
 * console.log(gcd(1.2, 0.8)); // 0.4 (GCD of scaled integers, then scaled back)
 * console.log(gcd(2.5, 1.5)); // 0.5
 *
 * // Edge cases
 * console.log(gcd(0, 5)); // 5 (GCD with zero)
 * console.log(gcd(7, 0)); // 7 (GCD with zero)
 * console.log(gcd(0, 0)); // 0 (by convention)
 * console.log(gcd(-12, 8)); // 4 (absolute values used)
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - gcd(a, 0) = |a| for any non-zero a
 * - gcd(0, 0) = 0 by convention
 * - gcd(a, b) = gcd(b, a) (commutative)
 * - gcd(a, b) = gcd(|a|, |b|) (sign independent)
 * - Always returns a non-negative result
 *
 * **Use Cases:**
 * - Simplifying fractions to lowest terms
 * - Finding common denominators in fraction arithmetic
 * - Cryptographic algorithms (RSA key generation)
 * - Number theory and mathematical proofs
 * - Optimization problems requiring common factors
 * - Periodic pattern analysis and frequency calculations
 *
 * **Performance:** O(log(min(a, b))) time complexity using Euclidean algorithm.
 * For decimal inputs, includes O(1) scaling operations. Space complexity is O(1).
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
