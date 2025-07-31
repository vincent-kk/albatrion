/**
 * Generates a random string using specified radix conversion.
 *
 * Creates pseudo-random strings by converting Math.random() output to the
 * specified radix and removing the '0.' prefix. Higher radix values produce
 * shorter strings with more character variety.
 *
 * @param radix - Base for number conversion (2-36, defaults to 32)
 * @returns Random string without decimal prefix
 *
 * @example
 * String generation:
 * ```typescript
 * import { getRandomString } from '@winglet/common-utils';
 *
 * console.log(getRandomString()); // 'k2j4h7m' (base 32)
 * console.log(getRandomString(16)); // 'a7f3d9e2' (hexadecimal)
 * console.log(getRandomString(36)); // 'xyz123' (alphanumeric)
 * ```
 */
export const getRandomString = (radix: number = 32) =>
  Math.random().toString(radix).slice(2);

/**
 * Generates a random integer within an inclusive range.
 *
 * Uses Math.random() with proper scaling and flooring to ensure uniform
 * distribution across the specified range with both bounds inclusive.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max
 *
 * @example
 * Integer generation:
 * ```typescript
 * import { getRandomNumber } from '@winglet/common-utils';
 *
 * console.log(getRandomNumber(1, 10)); // 7 (between 1-10)
 * console.log(getRandomNumber(0, 100)); // 42 (between 0-100)
 * console.log(getRandomNumber(-5, 5)); // -2 (between -5 to 5)
 * ```
 */
export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates a random boolean value with equal probability.
 *
 * Uses Math.random() with 0.5 threshold to provide true/false values
 * with approximately 50% probability each.
 *
 * @returns Boolean value (true or false with equal likelihood)
 *
 * @example
 * Boolean generation:
 * ```typescript
 * import { getRandomBoolean } from '@winglet/common-utils';
 *
 * console.log(getRandomBoolean()); // true or false
 * 
 * // Usage in conditional logic
 * if (getRandomBoolean()) {
 *   console.log('Random condition met!');
 * }
 * ```
 */
export const getRandomBoolean = () => Math.random() < 0.5;
