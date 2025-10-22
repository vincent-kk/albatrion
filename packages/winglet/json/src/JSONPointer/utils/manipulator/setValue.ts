import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { setValueByPointer } from './utils/setValueByPointer';

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
 * **Options:**
 * The function accepts an optional configuration object with the following properties:
 *
 * - **`overwrite`** (boolean, default: `true`):
 *   Controls behavior when the target location already has a value.
 *   - `true`: Replaces existing values at the target location
 *   - `false`: Preserves existing values, only sets if location is undefined
 *
 * - **`preserveNull`** (boolean, default: `false`):
 *   Controls behavior when encountering `null` values in intermediate paths.
 *   - `true`: Preserves `null` values, returns original object without modification
 *   - `false`: Replaces `null` with objects/arrays to continue path traversal
 *
 *   Note: This only affects intermediate path segments, not the final target value.
 *   Setting a final value to `null` is always allowed regardless of this option
 *
 * @template Input - Input object type constraint (Dictionary or Array)
 * @param value - The target JSON document to modify.
 *                Must be a plain object or array. Other types will throw an error.
 *                The input object is modified in place and returned.
 * @param pointer - JSON Pointer specifying the location where the value should be set.
 *                  Can be provided as:
 *                  - String: JSON Pointer string following RFC 6901 format
 *                  - Array: Sequence of reference tokens as string array
 * @param input - The value to set at the specified location.
 *                Can be any valid JSON value (object, array, string, number, boolean, null).
 * @param options - Optional configuration object controlling set behavior:
 *                  - `overwrite` (boolean, default: true): Whether to replace existing values
 *                  - `preserveNull` (boolean, default: false): Whether to preserve null in intermediate paths
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
 * setValue(obj, '/foo/bar', 'qux');
 * // Returns: { foo: { bar: 'qux' } }
 *
 * setValue(obj, ['foo', 'newProp'], 'value');
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
 * setValue(data, '/users/0/age', 31);
 * // Returns: { users: [{ name: "Alice", age: 31 }] }
 *
 * setValue(data, '/users/1', { name: "Bob", age: 25 });
 * // Returns: { users: [{ name: "Alice", age: 31 }, { name: "Bob", age: 25 }] }
 * ```
 *
 * @example
 * ```typescript
 * // Automatic path creation
 * const obj = {};
 *
 * setValue(obj, '/nested/deep/property', 'value');
 * // Returns: { nested: { deep: { property: 'value' } } }
 *
 * setValue(obj, '/array/0/item', 'first');
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
 * setValue(obj, '/existing', 'modified', { overwrite: true });
 * // Returns: { existing: "modified", other: "data" }
 *
 * setValue(obj, '/existing', 'ignored', { overwrite: false });
 * // Returns: { existing: "modified", other: "data" } (unchanged)
 *
 * setValue(obj, '/new', 'value', { overwrite: false });
 * // Returns: { existing: "modified", other: "data", new: "value" }
 * ```
 *
 * @example
 * ```typescript
 * // Null preservation in intermediate paths
 * const obj = { profile: null };
 *
 * // Default behavior: null is replaced
 * setValue(obj, '/profile/name', 'John');
 * // Returns: { profile: { name: "John" } }
 *
 * // Preserve null: returns original unchanged
 * const obj2 = { profile: null };
 * setValue(obj2, '/profile/name', 'John', { preserveNull: true });
 * // Returns: { profile: null } (unchanged)
 *
 * // Setting final value to null is always allowed
 * const obj3 = { profile: { name: "John" } };
 * setValue(obj3, '/profile/name', null);
 * // Returns: { profile: { name: null } }
 * ```
 *
 * @example
 * ```typescript
 * // Escaped character handling
 * const obj = {};
 *
 * setValue(obj, '/foo~1bar', 'slash');  // ~1 represents /
 * // Returns: { "foo/bar": "slash" }
 *
 * setValue(obj, '/foo~0bar', 'tilde');  // ~0 represents ~
 * // Returns: { "foo/bar": "slash", "foo~bar": "tilde" }
 * ```
 *
 * @example
 * ```typescript
 * // Root replacement
 * const obj = { old: "data" };
 *
 * setValue(obj, '', { completely: "new" });
 * // Returns: { completely: "new" }
 * ```
 */
export const setValue = <
  Output extends Dictionary | Array<any> = Dictionary | Array<any>,
>(
  value: Dictionary | Array<any>,
  pointer: string | string[],
  input: any,
  options?: { overwrite?: boolean; preserveNull?: boolean },
): Output => {
  if (!(isPlainObject(value) || isArray(value)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input: value },
    );
  const overwrite = options?.overwrite ?? true;
  const preserveNull = options?.preserveNull ?? false;
  return setValueByPointer(
    value,
    compilePointer(pointer),
    input,
    overwrite,
    preserveNull,
  ) as Output;
};
