import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { setValue } from './utils/setValue';

/**
 * Sets a value at a specific location in a JSON document using JSON Pointer notation.
 *
 * This function implements the JSON Pointer specification (RFC 6901) to navigate
 * through nested object structures and set values at specific locations. JSON Pointer
 * provides a standardized syntax for identifying specific locations within a JSON document
 * using a sequence of reference tokens, enabling precise modification of nested data structures.
 *
 * The function supports both string and array representations of JSON Pointers:
 * - **String format**: Uses forward slashes (`/`) as delimiters (e.g., `/foo/bar`)
 * - **Array format**: Each element represents a reference token (e.g., ["foo", "bar"])
 * - **Empty pointer**: Replaces the entire input object with the new value
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
 * **Path Creation Behavior:**
 * - Creates intermediate objects/arrays automatically when they don't exist
 * - For numeric keys in objects, creates array structures when appropriate
 * - Preserves existing structure when possible
 * - Supports both object property and array index assignments
 *
 * **Overwrite Control:**
 * The `overwrite` parameter controls behavior when the target location already exists:
 * - `true` (default): Replaces existing values
 * - `false`: Preserves existing values, only sets if location is empty/undefined
 *
 * @template Input - Input object type constraint (Dictionary or Array)
 * @param input - The target JSON document to modify.
 *                Must be a plain object or array. Other types will throw an error.
 *                The input object is modified in place and returned.
 * @param pointer - JSON Pointer specifying the location where the value should be set.
 *                  Can be provided as:
 *                  - String: JSON Pointer string following RFC 6901 format
 *                  - Array: Sequence of reference tokens as string array
 * @param value - The value to set at the specified location.
 *                Can be any valid JSON value (object, array, string, number, boolean, null).
 * @param overwrite - Controls whether to overwrite existing values at the target location.
 *                    When true (default), existing values are replaced.
 *                    When false, existing values are preserved and the operation is skipped.
 *                    This is an implementation-specific feature not defined in RFC 6901.
 *
 * @returns The modified input object with the value set at the specified location.
 *          The return value is the same reference as the input (modified in place).
 *
 * @throws {JSONPointerError} Thrown in the following cases:
 *         - **INVALID_INPUT**: When input is not a plain object or array
 *         - **INVALID_POINTER**: When pointer format is malformed
 *         - **INVALID_PATH**: When intermediate path cannot be created or accessed
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 *
 * @example
 * ```typescript
 * // Basic object property setting
 * const obj = {
 *   foo: {
 *     bar: "baz"
 *   }
 * };
 *
 * setValueByPointer(obj, '/foo/bar', 'qux');
 * // Returns: { foo: { bar: 'qux' } }
 *
 * setValueByPointer(obj, ['foo', 'newProp'], 'value');
 * // Returns: { foo: { bar: 'qux', newProp: 'value' } }
 * ```
 *
 * @example
 * ```typescript
 * // Array manipulation
 * const data = {
 *   users: [
 *     { name: "Alice", age: 30 }
 *   ]
 * };
 *
 * setValueByPointer(data, '/users/0/age', 31);
 * // Returns: { users: [{ name: "Alice", age: 31 }] }
 *
 * setValueByPointer(data, '/users/1', { name: "Bob", age: 25 });
 * // Returns: { users: [{ name: "Alice", age: 31 }, { name: "Bob", age: 25 }] }
 * ```
 *
 * @example
 * ```typescript
 * // Automatic path creation
 * const obj = {};
 *
 * setValueByPointer(obj, '/nested/deep/property', 'value');
 * // Returns: { nested: { deep: { property: 'value' } } }
 *
 * setValueByPointer(obj, '/array/0/item', 'first');
 * // Returns: {
 * //   nested: { deep: { property: 'value' } },
 * //   array: [{ item: 'first' }]
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Overwrite control
 * const obj = { existing: "original", other: "data" };
 *
 * setValueByPointer(obj, '/existing', 'modified', true);
 * // Returns: { existing: "modified", other: "data" }
 *
 * setValueByPointer(obj, '/existing', 'ignored', false);
 * // Returns: { existing: "modified", other: "data" } (unchanged)
 *
 * setValueByPointer(obj, '/new', 'value', false);
 * // Returns: { existing: "modified", other: "data", new: "value" }
 * ```
 *
 * @example
 * ```typescript
 * // Escaped character handling
 * const obj = {};
 *
 * setValueByPointer(obj, '/foo~1bar', 'slash');  // ~1 represents /
 * // Returns: { "foo/bar": "slash" }
 *
 * setValueByPointer(obj, '/foo~0bar', 'tilde');  // ~0 represents ~
 * // Returns: { "foo/bar": "slash", "foo~bar": "tilde" }
 * ```
 *
 * @example
 * ```typescript
 * // Root replacement
 * const obj = { old: "data" };
 *
 * setValueByPointer(obj, '', { completely: "new" });
 * // Returns: { completely: "new" }
 * ```
 */
export const setValueByPointer = <Input extends Dictionary | Array<any>>(
  input: Input,
  pointer: string | string[],
  value: any,
  overwrite: boolean = true,
): Dictionary | Array<any> => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return setValue(input, compilePointer(pointer), value, overwrite);
};
