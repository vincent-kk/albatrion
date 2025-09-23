/**
 * Checks if a number falls within a specified range (inclusive).
 *
 * Determines whether the given value is greater than or equal to the minimum
 * and less than or equal to the maximum bounds. Both bounds are inclusive,
 * meaning the value can equal either the minimum or maximum and still be considered in range.
 *
 * @param value - Number to test for range inclusion
 * @param min - Minimum bound (inclusive)
 * @param max - Maximum bound (inclusive)
 * @returns True if value is within [min, max] range, false otherwise
 *
 * @example
 * Basic range checking:
 * ```typescript
 * import { inRange } from '@winglet/common-utils';
 *
 * console.log(inRange(5, 1, 10)); // true (5 is between 1 and 10)
 * console.log(inRange(1, 1, 10)); // true (boundary value - min)
 * console.log(inRange(10, 1, 10)); // true (boundary value - max)
 * console.log(inRange(0, 1, 10)); // false (below minimum)
 * console.log(inRange(15, 1, 10)); // false (above maximum)
 * ```
 *
 * @example
 * Decimal numbers and edge cases:
 * ```typescript
 * // Decimal numbers
 * console.log(inRange(2.5, 2.0, 3.0)); // true
 * console.log(inRange(1.99, 2.0, 3.0)); // false
 *
 * // Negative ranges
 * console.log(inRange(-5, -10, -1)); // true
 * console.log(inRange(0, -10, -1)); // false
 *
 * // Zero-width ranges
 * console.log(inRange(5, 5, 5)); // true (single point range)
 * ```
 *
 * @remarks
 * **Range Properties:**
 * - Both minimum and maximum bounds are inclusive
 * - Works with positive, negative, and decimal numbers
 * - No validation that min ≤ max (caller responsibility)
 * - Returns false if min > max and value is between them
 *
 * **Use Cases:**
 * - Input validation for user interfaces
 * - Boundary checking in algorithms
 * - Data filtering and validation
 * - Game development (collision detection, boundaries)
 * - Statistical analysis (outlier detection)
 * - Configuration validation (acceptable parameter ranges)
 *
 * **Performance:** O(1) time and space complexity - simple comparison operations.
 */
export const inRange = (value: number, min: number, max: number): boolean =>
  value >= min && value <= max;
