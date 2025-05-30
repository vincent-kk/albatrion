import type { Dictionary } from '@aileron/declare';

import type { Fetch } from './type';
import { compareRecursive } from './utils/compareRecursive';

/**
 * Compares two JSON objects or arrays and returns an array of operations representing the differences.
 *
 * This function performs a deep comparison between source and target objects/arrays and generates
 * a list of JSON Pointer-based operations (ADD, REMOVE, REPLACE) that would transform the source
 * into the target. The comparison follows these rules:
 *
 * - Objects with the same structure are compared recursively
 * - Primitive values are compared by equality
 * - Missing properties in target result in REMOVE operations
 * - New properties in target result in ADD operations
 * - Changed values result in REPLACE operations
 * - Objects with `toJson()` method are automatically serialized before comparison
 *
 * @template Source - The type of the source object/array, must extend Dictionary or Array<any>
 * @template Target - The type of the target object/array, must extend Dictionary or Array<any>
 *
 * @param source - The source object or array to compare from
 * @param target - The target object or array to compare to
 *
 * @returns An array of Fetch operations representing the differences between source and target.
 *          Each operation contains:
 *          - `operation`: The type of change (ADD, REMOVE, REPLACE)
 *          - `path`: JSON Pointer path to the changed property
 *          - `value`: The new value (for ADD and REPLACE operations)
 *
 * @example
 * ```typescript
 * const source = { name: "John", age: 30, city: "NYC" };
 * const target = { name: "John", age: 31, country: "USA" };
 *
 * const changes = compare(source, target);
 * // Returns:
 * // [
 * //   { operation: "REPLACE", path: "/age", value: 31 },
 * //   { operation: "REMOVE", path: "/city" },
 * //   { operation: "ADD", path: "/country", value: "USA" }
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * const sourceArray = [1, 2, 3];
 * const targetArray = [1, 3, 4];
 *
 * const changes = compare(sourceArray, targetArray);
 * // Returns operations showing index-based changes
 * ```
 */
export const compare = <
  Source extends Dictionary | Array<any>,
  Target extends Dictionary | Array<any>,
>(
  source: Source,
  target: Target,
): Fetch[] => {
  const fetches: Fetch[] = [];
  compareRecursive(source, target, fetches);
  return fetches;
};
