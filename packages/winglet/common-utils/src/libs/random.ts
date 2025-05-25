/**
 * Function to generate a random string
 * Generates random string using Math.random()
 * @param radix - The radix to convert to(default: 32)
 * @returns String converted from random number to the specified radix (decimal part)
 */
export const getRandomString = (radix: number = 32) =>
  Math.random().toString(radix).slice(2);

/**
 * Function to generate a random integer within a given range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max
 */
export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Function to generate a random boolean value
 * @returns true or false with 50% probability each
 */
export const getRandomBoolean = () => Math.random() < 0.5;
