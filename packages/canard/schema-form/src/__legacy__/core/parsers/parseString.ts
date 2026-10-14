/**
 * Parses input value to string format.
 *
 * Behavior:
 * - string type: Returns the string as-is (including empty strings)
 * - number type: Converts to string using string concatenation
 * - other types: Returns empty string ""
 *
 * This parser is lenient with numbers but strict with other types.
 * Unlike toString() method, it safely handles null/undefined without throwing.
 *
 * Type conversion examples:
 * - "hello" → "hello"
 * - "" → "" (empty string preserved)
 * - 123 → "123"
 * - 0 → "0"
 * - -42.5 → "-42.5"
 * - true → "" (not "true")
 * - null → ""
 * - undefined → ""
 * - [] → ""
 * - {} → ""
 *
 * @param value - Value to parse (any type)
 * @returns Parsed string value or empty string for unsupported types
 *
 * @example
 * parseString('hello') // 'hello'
 * parseString(123) // '123'
 * parseString(true) // ''
 * parseString(null) // ''
 * parseString([1, 2]) // ''
 */
export const parseString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return '' + value;
  return '';
};
