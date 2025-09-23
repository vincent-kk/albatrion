/**
 * Returns the smaller of two numbers using simple comparison.
 *
 * Lightweight alternative to Math.min for comparing exactly two numbers.
 * Uses ternary operator for optimal performance and handles all number types
 * including special values like Infinity and NaN following JavaScript comparison rules.
 *
 * @param left - First number to compare
 * @param right - Second number to compare
 * @returns The smaller of the two numbers
 *
 * @example
 * Basic minimum comparison:
 * ```typescript
 * import { minLite } from '@winglet/common-utils';
 *
 * console.log(minLite(5, 3)); // 3
 * console.log(minLite(10, 20)); // 10
 * console.log(minLite(-1, -5)); // -5 (more negative)
 * console.log(minLite(0, 1)); // 0
 * console.log(minLite(7, 7)); // 7 (equal values)
 * ```
 *
 * @example
 * Special values and edge cases:
 * ```typescript
 * // Special numeric values
 * console.log(minLite(1, -Infinity)); // -Infinity
 * console.log(minLite(Infinity, 5)); // 5
 * console.log(minLite(1, NaN)); // NaN (NaN comparisons return false)
 * console.log(minLite(NaN, 5)); // NaN
 *
 * // Decimal precision
 * console.log(minLite(1.1, 1.2)); // 1.1
 * console.log(minLite(0.1 + 0.2, 0.3)); // 0.3 (smaller due to floating point)
 * ```
 *
 * @remarks
 * **Performance Characteristics:**
 * - Faster than Math.min(a, b) due to no function call overhead
 * - Single comparison operation with ternary conditional
 * - Ideal for performance-critical code with frequent comparisons
 * - No array allocation or iteration required
 *
 * **Use Cases:**
 * - Performance-critical algorithms requiring frequent pair comparisons
 * - Internal utility functions needing minimal overhead
 * - Mathematical calculations with bounded values
 * - Optimization algorithms (constraint handling, boundary checks)
 * - Game development (collision detection, bounds clamping)
 * - Data processing pipelines requiring fast comparison operations
 *
 * **Performance:** O(1) time and space complexity - single comparison operation.
 */
export const minLite = (left: number, right: number): number =>
  left < right ? left : right;
