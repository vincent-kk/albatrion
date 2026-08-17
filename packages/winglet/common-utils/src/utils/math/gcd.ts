import { abs } from './abs';
import { MAX_FRACTION_DIGITS } from './constant';
import { countDecimals } from './utils/countDecimals';
import { maxLite } from './maxLite';

/**
 * Calculates the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
 *
 * Computes the largest positive integer that divides both numbers without remainder.
 * Supports both integers and decimal numbers by scaling decimals to integers with
 * appropriate precision handling. Uses the efficient Euclidean algorithm for computation.
 *
 * @param left - First number (finite integer or decimal)
 * @param right - Second number (finite integer or decimal)
 * @returns Greatest common divisor of the two numbers, or `NaN` when either
 *   input is not finite or scaling a decimal input overflows to infinity
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
 *
 * // Values printed in exponential notation
 * console.log(gcd(1e-7, 2e-7)); // 1e-7
 *
 * // Undefined results
 * console.log(gcd(NaN, 5)); // NaN
 * console.log(gcd(Infinity, 5)); // NaN
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - gcd(a, 0) = |a| for any non-zero a
 * - gcd(0, 0) = 0 by convention
 * - gcd(a, b) = gcd(b, a) (commutative)
 * - gcd(a, b) = gcd(|a|, |b|) (sign independent)
 * - Always returns a non-negative result, or `NaN` where no result is defined
 *
 * **Decimal precision:** decimal inputs are scaled to integers by a power of ten
 * derived from their decimal places. When that scaling overflows to infinity the
 * result is `NaN` rather than an arbitrary finite value. Results needing more than
 * {@link MAX_FRACTION_DIGITS} fraction digits skip the final rounding pass, since
 * `toFixed` rejects counts above that limit.
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
  if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;
  if (left === 0 && right === 0) return 0;
  if (left === 0) return abs(right);
  if (right === 0) return abs(left);

  if (Number.isInteger(left) && Number.isInteger(right))
    return uclidGcd(left, right);

  const maxDecimals = maxLite(countDecimals(left), countDecimals(right));
  const scale = Math.pow(10, maxDecimals);
  const scaledLeft = Math.round(left * scale);
  const scaledRight = Math.round(right * scale);
  if (!Number.isFinite(scaledLeft) || !Number.isFinite(scaledRight)) return NaN;

  const result = uclidGcd(scaledLeft, scaledRight) / scale;
  return maxDecimals > MAX_FRACTION_DIGITS
    ? result
    : parseFloat(result.toFixed(maxDecimals));
};

/** Euclidean algorithm over finite operands; non-finite input would not terminate. */
const uclidGcd = (left: number, right: number): number => {
  let temp;
  while (right !== 0) {
    temp = right;
    right = left % right;
    left = temp;
  }
  return abs(left);
};
