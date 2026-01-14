/**
 * Compares two numbers for equality within a specified tolerance.
 *
 * Handles floating-point precision issues by using a combined relative and absolute
 * tolerance comparison. This approach works correctly across all number magnitudes,
 * from very small numbers near zero to very large numbers.
 *
 * @param left - First number to compare
 * @param right - Second number to compare
 * @param epsilon - Tolerance for comparison (default: 1e-8, matching NumPy's atol)
 * @returns true if the numbers are close within the specified tolerance
 *
 * @example
 * Basic floating-point comparison:
 * ```typescript
 * import { isClose } from '@winglet/common-utils/math';
 *
 * // Standard equality fails due to floating-point precision
 * console.log(0.1 + 0.2 === 0.3);        // false
 * console.log(isClose(0.1 + 0.2, 0.3));   // true
 *
 * // Works with various magnitudes
 * console.log(isClose(1e10, 1e10 + 1e-5));     // true (within tolerance)
 * console.log(isClose(1e-15, 2e-15));          // true (both near zero)
 * console.log(isClose(0.999999999, 1));        // true
 * ```
 *
 * @example
 * Custom epsilon for stricter or looser comparison:
 * ```typescript
 * // Stricter comparison (smaller epsilon)
 * console.log(isClose(1.0001, 1.0002, 1e-5));  // false
 * console.log(isClose(1.0001, 1.0002, 1e-3));  // true
 *
 * // Use Number.EPSILON for machine-precision comparison
 * console.log(isClose(1, 1 + Number.EPSILON, Number.EPSILON));  // true
 * ```
 *
 * @example
 * Special value handling:
 * ```typescript
 * // NaN comparison (unlike ===, treats NaN as equal to NaN)
 * console.log(NaN === NaN);          // false
 * console.log(isClose(NaN, NaN));     // true
 *
 * // Infinity handling
 * console.log(isClose(Infinity, Infinity));    // true
 * console.log(isClose(-Infinity, -Infinity));  // true
 * console.log(isClose(Infinity, -Infinity));   // false
 * console.log(isClose(Infinity, 1e308));       // false
 * ```
 *
 * @example
 * Convergence detection in iterative algorithms:
 * ```typescript
 * function findFixedPoint(f: (x: number) => number, x0: number) {
 *   let current = x0;
 *   let next = f(current);
 *
 *   while (!isClose(current, next)) {
 *     current = next;
 *     next = f(current);
 *   }
 *
 *   return next;
 * }
 * ```
 *
 * @remarks
 * **Algorithm:**
 * Uses a combined relative-absolute tolerance formula:
 * `|left - right| <= epsilon * max(|left|, |right|, 1)`
 *
 * This approach:
 * - Provides relative comparison for large numbers
 * - Falls back to absolute comparison near zero (due to the `1` in max)
 * - Handles edge cases efficiently with early returns
 *
 * **Special Cases:**
 * - `NaN === NaN` returns `true` (unlike standard equality)
 * - `Infinity === Infinity` returns `true` (same sign required)
 * - `0 === -0` returns `true`
 *
 * **Performance:** O(1) time and space complexity with minimal branching.
 *
 * **Use Cases:**
 * - Floating-point arithmetic validation
 * - Convergence detection in numerical algorithms
 * - Unit testing with tolerance
 * - Physics simulations and game development
 * - Financial calculations requiring precision tolerance
 */
export const isClose = (
  left: number,
  right: number,
  epsilon: number = 1e-8,
): boolean => {
  // Fast path: exact equality (handles ±0, same reference)
  if (left === right || (left !== left && right !== right)) return true;

  // Handle Infinity: must be exactly equal (handled by first check)
  // If we reach here with Infinity, they have different signs or one is finite
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;

  // Combined relative-absolute tolerance comparison
  // |left - right| <= epsilon * max(|left|, |right|, 1)
  const diff = left - right;
  const absLeft = left < 0 ? -left : left;
  const absRight = right < 0 ? -right : right;
  const maxAbs = absLeft > absRight ? absLeft : absRight;
  return (diff < 0 ? -diff : diff) <= epsilon * (maxAbs > 1 ? maxAbs : 1);
};
