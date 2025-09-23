import { abs } from './abs';

/**
 * Calculates the sum of all digits in an integer.
 *
 * Computes the digital root by adding all individual digits of the given integer.
 * For negative numbers, the calculation is performed on the absolute value.
 * This function is useful in number theory, digital root calculations, and checksum algorithms.
 *
 * @param value - Integer to calculate digit sum for (must be an integer)
 * @returns Sum of all digits in the number
 * @throws {Error} When value is not an integer or is a special value (Infinity, NaN)
 *
 * @example
 * Basic digit sum calculations:
 * ```typescript
 * import { digitSum } from '@winglet/common-utils';
 *
 * console.log(digitSum(123)); // 6 (1 + 2 + 3)
 * console.log(digitSum(456)); // 15 (4 + 5 + 6)
 * console.log(digitSum(1111)); // 4 (1 + 1 + 1 + 1)
 * console.log(digitSum(0)); // 0
 * console.log(digitSum(9)); // 9
 * ```
 *
 * @example
 * Negative numbers and large integers:
 * ```typescript
 * // Negative numbers use absolute value
 * console.log(digitSum(-123)); // 6 (same as digitSum(123))
 * console.log(digitSum(-456)); // 15 (same as digitSum(456))
 *
 * // Large numbers
 * console.log(digitSum(1234567890)); // 45 (1+2+3+4+5+6+7+8+9+0)
 * console.log(digitSum(999999999)); // 81 (9 * 9)
 * console.log(digitSum(1000000000)); // 1 (1+0+0+0+0+0+0+0+0+0)
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - Always returns a non-negative integer
 * - For single-digit numbers, returns the number itself
 * - For negative numbers, uses absolute value (sign is ignored)
 * - Can be used iteratively to find digital root: digitSum(digitSum(n))
 *
 * **Use Cases:**
 * - Digital root calculations in numerology
 * - Checksum algorithms and data validation
 * - Number theory and mathematical analysis
 * - ISBN/EAN barcode validation algorithms
 * - Luhn algorithm for credit card validation
 * - Recreational mathematics and puzzles
 *
 * **Performance:** O(log₁₀(n)) time complexity where n is the input value.
 * Space complexity is O(1) as it uses iterative approach.
 */
export const digitSum = (value: number): number => {
  if (!Number.isInteger(value))
    throw new Error('digitSum is only defined for integers');
  const absValue = abs(value);
  let accumulator = 0;
  let number = absValue;
  while (number > 0) {
    accumulator += number % 10;
    number = Math.floor(number / 10);
  }
  return accumulator;
};
