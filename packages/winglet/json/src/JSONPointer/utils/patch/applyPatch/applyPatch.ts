import { isArray } from '@winglet/common-utils/filter';

import type { JsonRoot } from '@/json/type';

import type { Patch } from '../../patchModel';
import { applySinglePatch } from './applySinglePatch';
import type { ApplyPatchOptions } from './type';

/**
 * Applies an array of JSON Patch operations to a source object or array.
 *
 * This function takes a source object/array and applies a sequence of JSON Patch operations
 * to transform it according to the provided patches. The function supports all standard
 * JSON Patch operations (ADD, REMOVE, REPLACE, MOVE, COPY, TEST) and provides flexible
 * options for handling mutations and validation.
 *
 * The application process follows these principles:
 * - Operations are applied sequentially in the order provided
 * - Each operation is validated before application
 * - Path validation ensures security against prototype pollution
 * - Immutable mode preserves the source with copy-on-write path cloning while unchanged
 *   subtrees remain structurally shared between the source and result
 * - Strict mode enforces additional validation rules
 *
 * @template Result - The type of the result object/array, defaults to Source type
 *
 * @param source - The source object or array to apply patches to
 * @param patches - An array of JSON Patch operations to apply sequentially
 * @param options.strict - Whether to use strict validation (default: false)
 * @param options.immutable - Whether to preserve the source with copy-on-write path cloning
 *                            (default: true)
 * @param options.protectPrototype - Whether to prevent prototype pollution attacks (default: true)
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6902
 *
 * @returns A new object/array with all patches applied. If immutable is true, returns a new
 *          instance; otherwise, modifies and returns the original source.
 *
 * @remarks
 * Immutable mode structurally shares unchanged subtrees. If the same object is referenced by
 * multiple paths, only the path touched by a patch is detached from the source.
 *
 * @throws {JsonPatchError} When a patch operation fails due to:
 *         - Invalid path syntax or structure
 *         - Attempting to modify non-existent properties in strict mode
 *         - Security violations (prototype pollution attempts)
 *         - Type mismatches between expected and actual values
 *         - Array index out of bounds or invalid format
 *
 * @example
 * ```typescript
 * const source = { name: "John", age: 30, hobbies: ["reading"] };
 * const patches = [
 *   { op: "replace", path: "/age", value: 31 },
 *   { op: "add", path: "/city", value: "NYC" },
 *   { op: "add", path: "/hobbies/-", value: "coding" }
 * ];
 *
 * const result = applyPatch(source, patches);
 * // Returns: { name: "John", age: 31, city: "NYC", hobbies: ["reading", "coding"] }
 * ```
 *
 * @example
 * ```typescript
 * const sourceArray = [1, 2, 3];
 * const patches = [
 *   { op: "replace", path: "/1", value: 5 },
 *   { op: "add", path: "/3", value: 4 }
 * ];
 *
 * const result = applyPatch(sourceArray, patches);
 * // Returns: [1, 5, 3, 4]
 * ```
 *
 * @example
 * ```typescript
 * // Using strict mode for additional validation
 * const result = applyPatch(source, patches, { strict: true, immutable: false });
 * ```
 */
export const applyPatch = <Result extends JsonRoot = any>(
  source: JsonRoot,
  patches: Patch[],
  options?: ApplyPatchOptions,
): Result => {
  const strict = options?.strict ?? false;
  const immutable = options?.immutable ?? true;
  const protectPrototype = options?.protectPrototype ?? true;

  const cloned = immutable ? new WeakSet<object>() : null;
  let result: any = source;
  if (cloned !== null && source !== null && typeof source === 'object') {
    result = isArray(source) ? source.slice() : { ...source };
    cloned.add(result);
  }
  for (let i = 0, l = patches.length; i < l; i++)
    result = applySinglePatch(
      result,
      patches[i],
      i,
      strict,
      protectPrototype,
      cloned,
    );
  return result as Result;
};
