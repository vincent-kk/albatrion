import { BASE_36_DIGITS } from './constant';

/**
 * Converts a string representation of a number in any base (2-36) to decimal.
 *
 * Parses a string containing digits and letters representing a number in the specified
 * base and converts it to its decimal (base 10) equivalent. Supports negative numbers
 * and uses case-insensitive letter parsing for bases greater than 10.
 *
 * @param value - String representation of the number (must be non-empty)
 * @param base - Numeric base from 2 to 36 (2=binary, 8=octal, 16=hex, etc.)
 * @returns Decimal number equivalent of the input
 * @throws {Error} When value is empty/invalid, base is out of range, or invalid digits found
 *
 * @example
 * Common base conversions:
 * ```typescript
 * import { fromBase } from '@winglet/common-utils';
 *
 * // Binary (base 2)
 * console.log(fromBase('1010', 2)); // 10
 * console.log(fromBase('1111', 2)); // 15
 *
 * // Octal (base 8)
 * console.log(fromBase('17', 8)); // 15
 * console.log(fromBase('777', 8)); // 511
 *
 * // Hexadecimal (base 16)
 * console.log(fromBase('FF', 16)); // 255
 * console.log(fromBase('1A3', 16)); // 419
 * ```
 *
 * @example
 * Advanced base conversions and edge cases:
 * ```typescript
 * // High bases with letters
 * console.log(fromBase('ZZ', 36)); // 1295 (35*36 + 35)
 * console.log(fromBase('10', 36)); // 36
 *
 * // Negative numbers
 * console.log(fromBase('-1010', 2)); // -10
 * console.log(fromBase('-FF', 16)); // -255
 *
 * // Case insensitive
 * console.log(fromBase('abc', 16)); // 2748 (same as 'ABC')
 * console.log(fromBase('ABC', 16)); // 2748
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
 * - Converting user input from different numeric systems
 * - Parsing configuration files with different base representations
 * - Educational tools for teaching number systems
 * - Cryptography and encoding/decoding operations
 * - Computer science algorithms requiring base conversion
 * - Data format parsing (hex colors, binary flags, etc.)
 *
 * **Performance:** O(n) time complexity where n is the length of the input string.
 * Space complexity is O(1) excluding input string.
 */
export const fromBase = (value: string, base: number): number => {
  if (typeof value !== 'string' || value.length === 0)
    throw new Error('Value must be a non-empty string');
  if (!Number.isInteger(base) || base < 2 || base > 36)
    throw new Error('Base must be an integer between 2 and 36');

  const isNegative = value[0] === '-';
  const cleanValue = isNegative ? value.slice(1) : value;
  const upperValue = cleanValue.toUpperCase();

  let result = 0;
  for (let i = 0; i < upperValue.length; i++) {
    const digit = BASE_36_DIGITS.indexOf(upperValue[i]);
    if (digit === -1 || digit >= base)
      throw new Error(`Invalid digit '${upperValue[i]}' for base ${base}`);
    result = result * base + digit;
  }
  return isNegative ? -result : result;
};
