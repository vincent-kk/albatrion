import { sum } from './sum';

/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 *
 * Computes the sum of all numbers divided by the count of numbers. Returns NaN
 * for empty arrays following mathematical convention. Uses the optimized sum utility
 * function for efficient calculation of the total.
 *
 * @param numbers - Array of numbers to calculate mean from (readonly)
 * @returns Arithmetic mean of the numbers, or NaN if array is empty
 *
 * @example
 * Basic mean calculations:
 * ```typescript
 * import { mean } from '@winglet/common-utils';
 *
 * console.log(mean([1, 2, 3, 4, 5])); // 3 (sum: 15, count: 5)
 * console.log(mean([10, 20, 30])); // 20
 * console.log(mean([2.5, 3.5, 4.5])); // 3.5
 * console.log(mean([100])); // 100 (single element)
 * console.log(mean([-5, 0, 5])); // 0 (balanced positive/negative)
 * ```
 *
 * @example
 * Edge cases and special scenarios:
 * ```typescript
 * // Empty array
 * console.log(mean([])); // NaN
 *
 * // Arrays with special values
 * console.log(mean([1, NaN, 3])); // NaN (NaN propagates)
 * console.log(mean([1, Infinity, 3])); // Infinity
 * console.log(mean([-Infinity, Infinity])); // NaN (Infinity - Infinity)
 *
 * // Real-world data
 * console.log(mean([85, 90, 78, 92, 88])); // 86.6 (test scores)
 * console.log(mean([1.1, 2.2, 3.3])); // 2.2 (decimal precision)
 * ```
 *
 * @remarks
 * **Statistical Properties:**
 * - Arithmetic mean is sensitive to outliers
 * - Returns NaN for empty datasets (undefined mean)
 * - Maintains precision for decimal calculations
 * - NaN values in input propagate to output
 *
 * **Use Cases:**
 * - Statistical analysis and data science
 * - Performance metrics and KPI calculations
 * - Grade and score averaging
 * - Financial analysis (average returns, prices)
 * - Scientific measurements and experimental data
 * - Quality metrics and business intelligence
 *
 * **Performance:** O(n) time complexity due to sum calculation, O(1) space complexity.
 * Efficient single-pass algorithm through the array.
 */
export const mean = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return NaN;
  return sum(numbers) / numbers.length;
};