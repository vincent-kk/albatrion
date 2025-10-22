import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { getValueByPointer } from './utils/getValueByPointer';

/**
 * Extracts a value from a JSON document using JSON Pointer notation.
 *
 * This function implements the JSON Pointer specification (RFC 6901) to navigate
 * through nested object structures and extract values at specific locations. JSON Pointer
 * provides a standardized syntax for identifying specific values within a JSON document
 * using a sequence of reference tokens.
 *
 * The function supports both string and array representations of JSON Pointers:
 * - **String format**: Uses forward slashes (`/`) as delimiters (e.g., `/foo/bar`)
 * - **Array format**: Each element represents a reference token (e.g., ["foo", "bar"])
 * - **Empty pointer**: Returns the entire input object
 * - **Root reference**: `/` or `#/` points to the root of the document
 *
 * Reference tokens are interpreted according to RFC 6901 escape sequences:
 * - `~0` represents the literal character `~`
 * - `~1` represents the literal character `/`
 *
 * The function performs strict validation on the input object, requiring it to be
 * either a plain object or an array. This ensures type safety and prevents
 * unexpected behavior with primitive values or non-plain objects.
 *
 * @template Input - Input object type constraint (Dictionary or Array)
 * @param value - The target JSON document to extract value from.
 *                Must be a plain object or array. Other types will throw an error.
 * @param pointer - JSON Pointer specifying the location of the value to extract.
 *                  Can be provided as:
 *                  - String: JSON Pointer string following RFC 6901 format
 *                  - Array: Sequence of reference tokens as string array
 *
 * @returns The value located at the specified JSON Pointer location.
 *          Returns any valid JSON value (object, array, string, number, boolean, null).
 *
 * @throws {JSONPointerError} Thrown in the following cases:
 *         - **INVALID_INPUT**: When input is not a plain object or array
 *         - **INVALID_POINTER**: When pointer format is malformed
 *         - **PROPERTY_NOT_FOUND**: When the pointer references a non-existent path
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 *
 * @example
 * ```typescript
 * // Basic object property access
 * const obj = {
 *   foo: {
 *     bar: "baz"
 *   }
 * };
 *
 * getValue(obj, '/foo/bar');
 * // Returns: "baz"
 *
 * getValue(obj, ['foo', 'bar']);
 * // Returns: "baz"
 * ```
 *
 * @example
 * ```typescript
 * // Array index access
 * const data = {
 *   users: [
 *     { name: "Alice", age: 30 },
 *     { name: "Bob", age: 25 }
 *   ]
 * };
 *
 * getValue(data, '/users/0/name');
 * // Returns: "Alice"
 *
 * getValue(data, '/users/1/age');
 * // Returns: 25
 * ```
 *
 * @example
 * ```typescript
 * // Root document access
 * const document = { title: "Document", content: "..." };
 *
 * getValue(document, '');
 * // Returns: { title: "Document", content: "..." }
 *
 * getValue(document, []);
 * // Returns: { title: "Document", content: "..." }
 * ```
 *
 * @example
 * ```typescript
 * // Escaped character handling
 * const obj = {
 *   "foo/bar": "value1",
 *   "foo~bar": "value2"
 * };
 *
 * getValue(obj, '/foo~1bar');  // ~1 represents /
 * // Returns: "value1"
 *
 * getValue(obj, '/foo~0bar');  // ~0 represents ~
 * // Returns: "value2"
 * ```
 *
 * @example
 * ```typescript
 * // Complex nested structure
 * const complex = {
 *   api: {
 *     v1: {
 *       endpoints: [
 *         { path: "/users", methods: ["GET", "POST"] },
 *         { path: "/posts", methods: ["GET"] }
 *       ]
 *     }
 *   }
 * };
 *
 * getValue(complex, '/api/v1/endpoints/0/methods/1');
 * // Returns: "POST"
 * ```
 */
export const getValue = <
  Output extends Dictionary | Array<any> = Dictionary | Array<any>,
>(
  value: Dictionary | Array<any>,
  pointer: string | string[],
): Output => {
  if (!(isPlainObject(value) || isArray(value)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input: value },
    );
  return getValueByPointer(value, compilePointer(pointer)) as Output;
};
