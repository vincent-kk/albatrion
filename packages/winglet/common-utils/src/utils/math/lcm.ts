import { abs } from './abs';
import { gcd } from './gcd';
import { maxLite } from './maxLite';

/**
 * Calculates the least common multiple (LCM) of two numbers with precision handling.
 *
 * Computes the smallest positive number that is divisible by both input numbers.
 * Supports both integers and decimal numbers by handling floating-point precision
 * issues appropriately. Uses the mathematical relationship: LCM(a,b) = |a×b| / GCD(a,b).
 *
 * @param left - First number (integer or decimal)
 * @param right - Second number (integer or decimal)
 * @returns Least common multiple of the two numbers
 *
 * @example
 * Integer LCM calculations:
 * ```typescript
 * import { lcm } from '@winglet/common-utils';
 *
 * console.log(lcm(12, 8)); // 24 (smallest number divisible by both 12 and 8)
 * console.log(lcm(15, 25)); // 75
 * console.log(lcm(7, 11)); // 77 (coprime numbers: LCM = product)
 * console.log(lcm(6, 9)); // 18
 * console.log(lcm(100, 50)); // 100
 * ```
 *
 * @example
 * Decimal and edge case handling:
 * ```typescript
 * // Decimal numbers (with precision handling)
 * console.log(lcm(1.2, 0.8)); // 2.4 (LCM with proper decimal precision)
 * console.log(lcm(2.5, 1.5)); // 7.5
 *
 * // Edge cases
 * console.log(lcm(0, 5)); // 0 (LCM with zero)
 * console.log(lcm(7, 0)); // 0 (LCM with zero)
 * console.log(lcm(-12, 8)); // 24 (absolute values used)
 * console.log(lcm(-6, -9)); // 18 (absolute values used)
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - lcm(a, 0) = 0 for any number a
 * - lcm(a, b) = lcm(b, a) (commutative)
 * - lcm(a, b) = lcm(|a|, |b|) (sign independent)
 * - For coprime numbers: lcm(a, b) = |a × b|
 * - Always returns a non-negative result
 *
 * **Use Cases:**
 * - Finding common denominators for fraction arithmetic
 * - Synchronizing periodic events or cycles
 * - Algorithm optimization requiring common intervals
 * - Time scheduling and resource allocation
 * - Digital signal processing (sample rate conversion)
 * - Mathematical computations requiring common multiples
 *
 * **Performance:** O(log(min(a, b))) time complexity due to GCD calculation.
 * Space complexity is O(1). Includes precision handling for decimal inputs.
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
