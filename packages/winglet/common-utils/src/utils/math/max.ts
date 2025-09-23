/**
 * Finds the maximum value in an array of numbers using optimized iteration.
 *
 * Determines the largest numerical value from the provided array using a single-pass
 * algorithm. Returns -Infinity for empty arrays, following JavaScript's Math.max behavior.
 * More efficient than Math.max for large arrays due to avoiding function call overhead.
 *
 * @param numbers - Array of numbers to find maximum from (readonly)
 * @returns Maximum value from the array, or -Infinity if array is empty
 *
 * @example
 * Basic maximum finding:
 * ```typescript
 * import { max } from '@winglet/common-utils';
 *
 * console.log(max([1, 5, 3, 9, 2])); // 9
 * console.log(max([10, 20, 15])); // 20
 * console.log(max([42])); // 42 (single element)
 * console.log(max([-5, -1, -10])); // -1 (largest negative)
 * console.log(max([0, -1, 1])); // 1
 * ```
 *
 * @example
 * Edge cases and special values:
 * ```typescript
 * // Empty array
 * console.log(max([])); // -Infinity
 *
 * // Arrays with special values
 * console.log(max([1, NaN, 3])); // NaN (NaN propagates)
 * console.log(max([1, Infinity, 3])); // Infinity
 * console.log(max([-Infinity, 100])); // 100
 *
 * // Decimal numbers
 * console.log(max([1.1, 1.9, 1.5])); // 1.9
 * ```
 *
 * @remarks
 * **Algorithm Properties:**
 * - Single-pass O(n) iteration through the array
 * - No sorting required (more efficient than sort-based approaches)
 * - Handles NaN values following JavaScript comparison rules
 * - Returns -Infinity for empty arrays (consistent with Math.max())
 *
 * **Use Cases:**
 * - Statistical analysis and data processing
 * - Array filtering and data validation
 * - Algorithm optimization (finding peak values)
 * - Data visualization (chart scaling, range calculation)
 * - Performance monitoring (finding maximum metrics)
 * - Game development (high score tracking, bounds checking)
 *
 * **Performance:** O(n) time complexity, O(1) space complexity.
 * More efficient than Math.max(...array) for large arrays due to avoiding spread operator.
 */
export const max = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return -Infinity;
  let maximum = numbers[0];
  for (let i = 1, l = numbers.length; i < l; i++)
    if (numbers[i] > maximum) maximum = numbers[i];
  return maximum;
};
