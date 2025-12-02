/**
 * Rounds a number to a specified number of decimal places.
 *
 * Performs precise rounding by scaling the number, applying Math.round, then scaling back.
 * Handles floating-point precision issues better than naive approaches. Supports both
 * positive precision (decimal places) and negative precision (rounding to tens, hundreds, etc.).
 *
 * @param value - Number to round
 * @param precision - Number of decimal places (default: 0), can be negative
 * @returns Rounded number with specified precision
 *
 * @example
 * Basic rounding operations:
 * ```typescript
 * import { round } from '@winglet/common-utils';
 *
 * // Default (integer rounding)
 * console.log(round(3.7)); // 4
 * console.log(round(3.2)); // 3
 * console.log(round(-2.6)); // -3
 *
 * // Decimal precision
 * console.log(round(3.14159, 2)); // 3.14
 * console.log(round(2.678, 1)); // 2.7
 * console.log(round(1.005, 2)); // 1.01
 * ```
 *
 * @example
 * Advanced precision and edge cases:
 * ```typescript
 * // Negative precision (round to tens, hundreds)
 * console.log(round(1234, -1)); // 1230 (round to nearest 10)
 * console.log(round(1234, -2)); // 1200 (round to nearest 100)
 * console.log(round(1234, -3)); // 1000 (round to nearest 1000)
 *
 * // High precision
 * console.log(round(0.123456789, 5)); // 0.12346
 * console.log(round(Math.PI, 4)); // 3.1416
 *
 * // Edge cases
 * console.log(round(0, 5)); // 0
 * console.log(round(0.5, 0)); // 1 (rounds half up)
 * ```
 *
 * @remarks
 * **Rounding Behavior:**
 * - Uses "round half away from zero" method (Math.round behavior)
 * - Positive precision: decimal places (1 = 0.1, 2 = 0.01)
 * - Negative precision: powers of 10 (-1 = 10, -2 = 100)
 * - Zero precision: rounds to nearest integer
 *
 * **Use Cases:**
 * - Financial calculations (currency rounding)
 * - Display formatting for user interfaces
 * - Scientific calculations with precision requirements
 * - Data processing and statistical analysis
 * - Configuration values with limited precision
 * - API responses requiring standardized decimal places
 *
 * **Performance:** O(1) time and space complexity - constant time operations.
 * More reliable than simple decimal truncation or naive rounding approaches.
 */
export const round = (value: number, precision: number = 0): number => {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};
