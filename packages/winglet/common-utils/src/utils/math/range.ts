import { max } from './max';
import { min } from './min';

/**
 * Calculates the range (difference between maximum and minimum) of an array of numbers.
 *
 * Computes the spread of values by subtracting the minimum value from the maximum value.
 * Returns NaN for empty arrays following statistical convention. Useful for understanding
 * the variability and spread of a dataset.
 *
 * @param numbers - Array of numbers to calculate range from (readonly)
 * @returns Difference between max and min values, or NaN if array is empty
 *
 * @example
 * Basic range calculations:
 * ```typescript
 * import { range } from '@winglet/common-utils';
 *
 * console.log(range([1, 5, 3, 9, 2])); // 8 (9 - 1)
 * console.log(range([10, 20, 15])); // 10 (20 - 10)
 * console.log(range([42])); // 0 (single element)
 * console.log(range([5, 5, 5])); // 0 (all equal)
 * console.log(range([-5, 0, 5])); // 10 (5 - (-5))
 * ```
 *
 * @example
 * Edge cases and real-world scenarios:
 * ```typescript
 * // Empty array
 * console.log(range([])); // NaN
 *
 * // Decimal numbers
 * console.log(range([1.1, 1.9, 1.5])); // 0.8 (1.9 - 1.1)
 *
 * // Real data: test scores
 * console.log(range([85, 90, 78, 92, 88])); // 14 (92 - 78)
 *
 * // Stock prices
 * console.log(range([150.5, 147.2, 153.8, 149.1])); // 6.6 (153.8 - 147.2)
 * ```
 *
 * @remarks
 * **Statistical Properties:**
 * - Measures the spread or variability of a dataset
 * - Always non-negative (max ≥ min)
 * - Sensitive to outliers (extreme values)
 * - Returns 0 for datasets with identical values
 * - Simple measure of dispersion
 *
 * **Use Cases:**
 * - Statistical analysis and data exploration
 * - Quality control (acceptable variation ranges)
 * - Data visualization (chart scaling and axis ranges)
 * - Performance analysis (identifying variability)
 * - Financial analysis (price volatility, trading ranges)
 * - Scientific measurements (error margins, confidence intervals)
 *
 * **Performance:** O(n) time complexity due to max and min calculations, O(1) space complexity.
 * Efficient single-pass algorithm for both maximum and minimum finding.
 */
export const range = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return NaN;
  return max(numbers) - min(numbers);
};
