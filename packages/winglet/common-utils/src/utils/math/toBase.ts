import { BASE_36_DIGITS } from './constant';

/**
 * Converts a decimal integer to its string representation in any base (2-36).
 *
 * Transforms a decimal number into its equivalent representation in the specified
 * base system. Uses digits 0-9 and letters A-Z for bases greater than 10.
 * Supports negative numbers and provides efficient conversion algorithm.
 *
 * @param value - Integer to convert (must be an integer)
 * @param base - Target base from 2 to 36 (2=binary, 8=octal, 16=hex, etc.)
 * @returns String representation of the number in the specified base
 * @throws {Error} When value is not an integer or base is out of range
 *
 * @example
 * Common base conversions:
 * ```typescript
 * import { toBase } from '@winglet/common-utils';
 *
 * // Binary (base 2)
 * console.log(toBase(10, 2)); // "1010"
 * console.log(toBase(15, 2)); // "1111"
 *
 * // Octal (base 8)
 * console.log(toBase(15, 8)); // "17"
 * console.log(toBase(511, 8)); // "777"
 *
 * // Hexadecimal (base 16)
 * console.log(toBase(255, 16)); // "FF"
 * console.log(toBase(419, 16)); // "1A3"
 * ```
 *
 * @example
 * Advanced conversions and edge cases:
 * ```typescript
 * // High bases with letters
 * console.log(toBase(1295, 36)); // "ZZ"
 * console.log(toBase(36, 36)); // "10"
 *
 * // Negative numbers
 * console.log(toBase(-10, 2)); // "-1010"
 * console.log(toBase(-255, 16)); // "-FF"
 *
 * // Special cases
 * console.log(toBase(0, 16)); // "0"
 * console.log(toBase(100, 10)); // "100" (decimal to decimal)
 * ```
 *
 * @remarks
 * **Supported Bases:**
 * - Base 2 (binary): digits 0-1
 * - Base 8 (octal): digits 0-7
 * - Base 10 (decimal): digits 0-9
 * - Base 16 (hexadecimal): digits 0-9, A-F
 * - Base 36 (maximum): digits 0-9, A-Z
 *
 * **Use Cases:**
 * - Number system conversion for educational purposes
 * - Computer science algorithms requiring different bases
 * - Cryptography and encoding systems
 * - Data representation and serialization
 * - Color code generation (hex colors)
 * - Compact number representation for IDs or tokens
 *
 * **Performance:** O(log_base(n)) time complexity where n is the input value.
 * Space complexity is O(log_base(n)) for the result string.
 */
export const toBase = (value: number, base: number): string => {
  if (!Number.isInteger(value))
    throw new Error('toBase is only defined for integers');

  if (!Number.isInteger(base) || base < 2 || base > 36)
    throw new Error('Base must be an integer between 2 and 36');

  if (value === 0) return '0';

  const isNegative = value < 0;
  let absValue = Math.abs(value);
  let result = '';

  while (absValue > 0) {
    result = BASE_36_DIGITS[absValue % base] + result;
    absValue = Math.floor(absValue / base);
  }

  return isNegative ? '-' + result : result;
};
