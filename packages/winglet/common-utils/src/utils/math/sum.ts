/**
 * Calculates the sum of all numbers in an array using optimized iteration.
 *
 * Adds all numerical values in the provided array using a single-pass algorithm.
 * Returns 0 for empty arrays following mathematical convention (empty sum).
 * More efficient than reduce() for simple summation due to avoiding function call overhead.
 *
 * @param numbers - Array of numbers to sum (readonly)
 * @returns Sum of all numbers in the array, or 0 if array is empty
 *
 * @example
 * Basic summation operations:
 * ```typescript
 * import { sum } from '@winglet/common-utils';
 *
 * console.log(sum([1, 2, 3, 4, 5])); // 15
 * console.log(sum([10, 20, 30])); // 60
 * console.log(sum([42])); // 42 (single element)
 * console.log(sum([])); // 0 (empty array)
 * console.log(sum([-1, 1, -2, 2])); // 0 (balanced positive/negative)
 * ```
 *
 * @example
 * Edge cases and decimal handling:
 * ```typescript
 * // Decimal numbers
 * console.log(sum([1.1, 2.2, 3.3])); // 6.6
 * console.log(sum([0.1, 0.2])); // 0.30000000000000004 (floating point)
 *
 * // Special values
 * console.log(sum([1, NaN, 3])); // NaN (NaN propagates)
 * console.log(sum([1, Infinity, 3])); // Infinity
 * console.log(sum([-Infinity, Infinity])); // NaN
 *
 * // Large arrays
 * console.log(sum(Array(1000).fill(1))); // 1000
 * ```
 *
 * @remarks
 * **Algorithm Properties:**
 * - Single-pass O(n) iteration through the array
 * - No sorting or complex operations required
 * - Handles NaN and Infinity following JavaScript arithmetic rules
 * - Returns 0 for empty arrays (mathematical identity element)
 * - Preserves floating-point precision characteristics
 *
 * **Use Cases:**
 * - Statistical calculations and data analysis
 * - Financial computations (totals, running balances)
 * - Scientific calculations and measurements
 * - Performance metrics and aggregation
 * - Gaming systems (score totals, resource counting)
 * - Business intelligence and reporting
 *
 * **Performance:** O(n) time complexity, O(1) space complexity.
 * More efficient than Array.reduce() for simple addition due to direct loop implementation.
 */
export const sum = (numbers: readonly number[]): number => {
  let accumulator = 0;
  for (let i = 0, l = numbers.length; i < l; i++) accumulator += numbers[i];
  return accumulator;
};
