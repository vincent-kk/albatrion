/**
 * Serializes a value using native JSON.stringify.
 * Alias for JSON.stringify.
 *
 * @param value - Value to serialize
 * @param replacer - Function to alter values during serialization or array of property names to include (optional)
 * @param space - String for formatting or number of spaces for indentation (optional)
 * @returns Serialized JSON string
 *
 * @example
 * serializeNative({a: 1, b: 2}); // '{"a":1,"b":2}'
 * serializeNative({a: 1, b: undefined}); // '{"a":1}'
 */
export const serializeNative = JSON.stringify;
