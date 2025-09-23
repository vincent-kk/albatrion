/**
 * Determines if a number is even using modulo operation.
 *
 * Checks whether the given number is divisible by 2 with no remainder.
 * Works with both positive and negative integers, and follows mathematical
 * convention that zero is considered even.
 *
 * @param value - Number to test for evenness
 * @returns True if the number is even, false if odd
 *
 * @example
 * Basic even number detection:
 * ```typescript
 * import { isEven } from '@winglet/common-utils';
 *
 * console.log(isEven(2)); // true
 * console.log(isEven(4)); // true
 * console.log(isEven(0)); // true (zero is even)
 * console.log(isEven(1)); // false
 * console.log(isEven(3)); // false
 * ```
 *
 * @example
 * Negative numbers and edge cases:
 * ```typescript
 * // Negative numbers
 * console.log(isEven(-2)); // true
 * console.log(isEven(-4)); // true
 * console.log(isEven(-1)); // false
 * console.log(isEven(-3)); // false
 *
 * // Large numbers
 * console.log(isEven(1000000)); // true
 * console.log(isEven(999999)); // false
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - Zero is considered even (0 = 2 × 0)
 * - Negative even numbers follow same pattern as positive
 * - Works with any integer value within JavaScript's safe integer range
 * - Does not validate input type (assumes numeric input)
 *
 * **Use Cases:**
 * - Array filtering (even indices, even values)
 * - Alternating patterns in UI (striped tables, zebra patterns)
 * - Mathematical algorithms requiring parity checks
 * - Game logic (turn-based systems, alternating players)
 * - Data validation and categorization
 * - Optimization algorithms using even/odd properties
 *
 * **Performance:** O(1) time and space complexity - single modulo operation.
 */
export const isEven = (value: number): boolean => value % 2 === 0;
