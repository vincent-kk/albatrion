/**
 * Finds the minimum value in an array of numbers using optimized iteration.
 *
 * Determines the smallest numerical value from the provided array using a single-pass
 * algorithm. Returns Infinity for empty arrays, following JavaScript's Math.min behavior.
 * More efficient than Math.min for large arrays due to avoiding function call overhead.
 *
 * @param numbers - Array of numbers to find minimum from (readonly)
 * @returns Minimum value from the array, or Infinity if array is empty
 *
 * @example
 * Basic minimum finding:
 * ```typescript
 * import { min } from '@winglet/common-utils';
 *
 * console.log(min([5, 1, 9, 3])); // 1
 * console.log(min([10, 20, 15])); // 10
 * console.log(min([42])); // 42 (single element)
 * console.log(min([-5, -1, -10])); // -10 (smallest negative)
 * console.log(min([0, 1, -1])); // -1
 * ```
 *
 * @example
 * Edge cases and special values:
 * ```typescript
 * // Empty array
 * console.log(min([])); // Infinity
 *
 * // Arrays with special values
 * console.log(min([1, NaN, 3])); // NaN (NaN propagates)
 * console.log(min([1, -Infinity, 3])); // -Infinity
 * console.log(min([Infinity, 100])); // 100
 *
 * // Decimal numbers
 * console.log(min([1.9, 1.1, 1.5])); // 1.1
 * ```
 *
 * @remarks
 * **Algorithm Properties:**
 * - Single-pass O(n) iteration through the array
 * - No sorting required (more efficient than sort-based approaches)
 * - Handles NaN values following JavaScript comparison rules
 * - Returns Infinity for empty arrays (consistent with Math.min())
 *
 * **Use Cases:**
 * - Statistical analysis and data processing
 * - Array filtering and data validation
 * - Algorithm optimization (finding minimum values)
 * - Data visualization (chart scaling, range calculation)
 * - Performance monitoring (finding minimum metrics)
 * - Quality control (detecting minimum thresholds)
 *
 * **Performance:** O(n) time complexity, O(1) space complexity.
 * More efficient than Math.min(...array) for large arrays due to avoiding spread operator.
 */
export const min = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return Infinity;
  let minimum = numbers[0];
  for (let i = 1, l = numbers.length; i < l; i++)
    if (numbers[i] < minimum) minimum = numbers[i];
  return minimum;
};
