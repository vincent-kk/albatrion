/**
 * Determines if a number is odd with proper handling for negative numbers.
 *
 * Checks whether the given number is not divisible by 2. Uses appropriate
 * modulo comparison based on the sign of the number to handle JavaScript's
 * modulo behavior with negative numbers correctly.
 *
 * @param value - Number to test for oddness
 * @returns True if the number is odd, false if even
 *
 * @example
 * Basic odd number detection:
 * ```typescript
 * import { isOdd } from '@winglet/common-utils';
 *
 * console.log(isOdd(1)); // true
 * console.log(isOdd(3)); // true
 * console.log(isOdd(5)); // true
 * console.log(isOdd(2)); // false
 * console.log(isOdd(4)); // false
 * console.log(isOdd(0)); // false (zero is even)
 * ```
 *
 * @example
 * Negative numbers and edge cases:
 * ```typescript
 * // Negative numbers (handled correctly)
 * console.log(isOdd(-1)); // true
 * console.log(isOdd(-3)); // true
 * console.log(isOdd(-5)); // true
 * console.log(isOdd(-2)); // false
 * console.log(isOdd(-4)); // false
 *
 * // Large numbers
 * console.log(isOdd(999999)); // true
 * console.log(isOdd(1000001)); // true
 * ```
 *
 * @remarks
 * **Implementation Details:**
 * - Handles JavaScript's modulo behavior with negative numbers
 * - For positive numbers: checks if value % 2 === 1
 * - For negative numbers: checks if value % 2 === -1
 * - Zero is correctly identified as even (not odd)
 *
 * **Use Cases:**
 * - Array filtering (odd indices, odd values)
 * - Alternating patterns complementary to even detection
 * - Mathematical algorithms requiring parity checks
 * - Game logic (turn-based systems, player identification)
 * - Data categorization and validation
 * - Optimization algorithms using odd/even properties
 *
 * **Performance:** O(1) time and space complexity - single modulo operation
 * with conditional check for sign handling.
 */
export const isOdd = (value: number): boolean =>
  value > 0 ? value % 2 === 1 : value % 2 === -1;
