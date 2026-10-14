/**
 * Parses input value to number format.
 *
 * Behavior:
 * - number type: Returns NaN if NaN, otherwise converts to integer/float
 * - string type: Removes all non-numeric characters then parses with parseFloat
 * - other types: Returns NaN
 *
 * String parsing examples:
 * - "$1,234.56" → 1234.56 (removes currency symbols and commas)
 * - "abc123def" → 123 (removes letters, extracts first number only)
 * - "1.2.3" → 1.2 (parseFloat behavior: stops at first valid number)
 * - "1-2-3" → 1 (parseFloat behavior: stops at first valid number)
 * - "" → NaN (empty string)
 *
 * Notes:
 * - Safely handles large numbers exceeding 32-bit integer range (uses Math.trunc)
 * - Multiple decimal points or minus signs may produce unexpected results
 *
 * @param value - Value to parse (number, string, or other)
 * @param isInteger - Whether to return as integer (default: false)
 * @returns Parsed number or NaN if parsing is impossible
 *
 * @example
 * parseNumber(123) // 123
 * parseNumber('123.456') // 123.456
 * parseNumber('$1,234.56') // 1234.56
 * parseNumber(123.456, true) // 123
 * parseNumber('abc') // NaN
 */
export const parseNumber = (value: unknown, isInteger = false): number => {
  if (typeof value === 'number')
    return isNaN(value) ? NaN : isInteger ? Math.trunc(value) : value;
  if (typeof value === 'string') {
    const parsedValue = parseFloat(value.replace(NON_NUMERIC_CHARS, ''));
    if (isNaN(parsedValue)) return NaN;
    return isInteger ? Math.trunc(parsedValue) : parsedValue;
  }
  return NaN;
};

const NON_NUMERIC_CHARS = /[^\d.-]/g;
