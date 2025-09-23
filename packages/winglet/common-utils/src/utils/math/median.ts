/**
 * Calculates the median (middle value) of an array of numbers.
 *
 * Finds the middle value when numbers are arranged in ascending order. For arrays
 * with even length, returns the average of the two middle values. Handles empty
 * arrays by returning NaN following statistical convention.
 *
 * @param numbers - Array of numbers to find median from (readonly)
 * @returns Median value, or NaN if array is empty
 *
 * @example
 * Basic median calculations:
 * ```typescript
 * import { median } from '@winglet/common-utils';
 *
 * // Odd length arrays (middle element)
 * console.log(median([1, 3, 5])); // 3
 * console.log(median([7, 1, 9, 3, 5])); // 5 (sorted: [1,3,5,7,9])
 *
 * // Even length arrays (average of middle two)
 * console.log(median([1, 2, 3, 4])); // 2.5 ((2+3)/2)
 * console.log(median([10, 20])); // 15 ((10+20)/2)
 * ```
 *
 * @example
 * Edge cases and real-world data:
 * ```typescript
 * // Empty array
 * console.log(median([])); // NaN
 *
 * // Single element
 * console.log(median([42])); // 42
 *
 * // Unsorted input (gets sorted automatically)
 * console.log(median([5, 1, 9, 3])); // 4 (sorted: [1,3,5,9], median: (3+5)/2)
 *
 * // Real data: test scores
 * console.log(median([85, 90, 78, 92, 88])); // 88
 * console.log(median([1.1, 2.2, 3.3, 4.4])); // 2.75
 * ```
 *
 * @remarks
 * **Statistical Properties:**
 * - Less sensitive to outliers compared to mean
 * - Represents the 50th percentile of the dataset
 * - For odd-length arrays: returns the exact middle element
 * - For even-length arrays: returns average of two middle elements
 * - Returns NaN for empty datasets
 *
 * **Use Cases:**
 * - Statistical analysis and data science
 * - Robust central tendency measurement
 * - Salary and income analysis (less skewed by extremes)
 * - Performance benchmarking and metrics
 * - Quality control and process monitoring
 * - Financial analysis (median house prices, returns)
 *
 * **Performance:** O(n log n) time complexity due to sorting, O(n) space complexity
 * for the sorted copy. Consider using a selection algorithm for better performance
 * if median calculation is frequent.
 */
export const median = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return NaN;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
  else return sorted[middle];
};
