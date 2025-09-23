/**
 * Returns the larger of two numbers using simple comparison.
 *
 * Lightweight alternative to Math.max for comparing exactly two numbers.
 * Uses ternary operator for optimal performance and handles all number types
 * including special values like Infinity and NaN following JavaScript comparison rules.
 *
 * @param left - First number to compare
 * @param right - Second number to compare
 * @returns The larger of the two numbers
 *
 * @example
 * Basic maximum comparison:
 * ```typescript
 * import { maxLite } from '@winglet/common-utils';
 *
 * console.log(maxLite(5, 3)); // 5
 * console.log(maxLite(10, 20)); // 20
 * console.log(maxLite(-1, -5)); // -1 (less negative)
 * console.log(maxLite(0, -1)); // 0
 * console.log(maxLite(7, 7)); // 7 (equal values)
 * ```
 *
 * @example
 * Special values and edge cases:
 * ```typescript
 * // Special numeric values
 * console.log(maxLite(1, Infinity)); // Infinity
 * console.log(maxLite(-Infinity, 5)); // 5
 * console.log(maxLite(1, NaN)); // NaN (NaN comparisons return false)
 * console.log(maxLite(NaN, 5)); // 5
 *
 * // Decimal precision
 * console.log(maxLite(1.1, 1.2)); // 1.2
 * console.log(maxLite(0.1 + 0.2, 0.3)); // 0.30000000000000004 (floating point)
 * ```
 *
 * @remarks
 * **Performance Characteristics:**
 * - Faster than Math.max(a, b) due to no function call overhead
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
export const maxLite = (left: number, right: number): number =>
  left > right ? left : right;
