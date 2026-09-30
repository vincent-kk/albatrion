/**
 * Parses input value to boolean format.
 *
 * Behavior:
 * - string type:
 *   - "true" (case-insensitive, trimmed) → true
 *   - "false" (case-insensitive, trimmed) → false
 *   - other strings → truthy evaluation (!!value)
 * - other types: Uses JavaScript truthy evaluation (!!value)
 *
 * String parsing examples:
 * - "true", "TRUE", " True " → true
 * - "false", "FALSE", " False " → false
 * - "hello", "1", "0" → true (truthy string)
 * - "" → false (empty string)
 *
 * Non-string examples:
 * - 1, 2, -1 → true
 * - 0 → false
 * - null, undefined → false
 * - [], {} → true (truthy objects)
 *
 * @param value - Value to parse (any type)
 * @returns Parsed boolean value
 *
 * @example
 * parseBoolean('true') // true
 * parseBoolean('FALSE') // false
 * parseBoolean('hello') // true
 * parseBoolean(1) // true
 * parseBoolean(0) // false
 * parseBoolean(null) // false
 */
export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;
  }
  return !!value;
};
