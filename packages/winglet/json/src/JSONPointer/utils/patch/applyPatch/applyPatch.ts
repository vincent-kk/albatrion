import { isArray } from '@winglet/common-utils/filter';

import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../patchModel';
import { copyObject } from './utils/copyObject';
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
 * - Reserved member names (__proto__, constructor, prototype) are handled as
 *   opaque own data — no patch input can modify the prototype chain
 * - Immutable mode never mutates the source or any patch value; containers not written
 *   remain structurally shared with both the source and patch values
 * - Root add, replace and move install values by reference like nested operations;
 *   a later write obtains ownership only when it needs to change that container
 * - A `test` operation compares values in every mode; a mismatch aborts the whole patch
 *
 * @template Result - The type of the result object/array, defaults to Source type
 *
 * @param source - The source object or array to apply patches to
 * @param patches - An array of JSON Patch operations to apply sequentially
 * @param options.strict - Deprecated and ignored; `test` always compares values
 * @param options.immutable - Whether to preserve the source with copy-on-write path cloning
 *                            (default: true)
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6902
 *
 * @returns The patched document. Immutable mode preserves caller-owned graphs but can
 *          return a root patch value itself. Mutable mode can modify the original source.
 *
 * @remarks
 * Container copies retain ordinary or null prototypes at every written depth.
 * Immutable mode structurally shares containers with the source and patch values. A final
 * root add or replace returns its value itself, just as a nested add installs that value
 * itself. If an object has several paths, only a path written by a patch is detached.
 *
 * Reserved member names (`__proto__`, `constructor`, `prototype`) addressed by a patch survive
 * into the result as own data properties. Copy such a result with spread, `structuredClone`, or a
 * JSON round-trip — each defines own data and keeps the key; assignment-based copies
 * (`Object.assign`, `target[key] = value`) route through the inherited `__proto__` setter, which
 * replaces the copy's prototype and drops the key. Test the result for plain objects with
 * `Object.getPrototypeOf` or `instanceof`, not `value.constructor` — an own `constructor` shadows
 * the inherited one.
 *
 * @throws {JSONPatchError} When a patch operation fails due to:
 *         - Invalid path syntax or structure
 *         - Removing, replacing or moving from a non-existent location
 *         - A `test` operation whose value does not match
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
 * // Mutating the source in place
 * const result = applyPatch(source, patches, { immutable: false });
 * ```
 */
export const applyPatch = <Result extends JSONRoot = any>(
  source: JSONRoot,
  patches: Patch[],
  options?: ApplyPatchOptions,
): Result => {
  const immutable = options?.immutable ?? true;

  const cloned = immutable ? new WeakSet<object>() : null;
  let result: any = source;
  if (cloned !== null && source !== null && typeof source === 'object') {
    result = isArray(source) ? source.slice() : copyObject(source);
    cloned.add(result);
  }
  let rootUnowned = false;
  for (let i = 0, l = patches.length; i < l; i++) {
    const patch = patches[i];
    if (
      rootUnowned &&
      cloned !== null &&
      result !== null &&
      typeof result === 'object'
    ) {
      const readsOrReplacesRoot =
        patch.path === '' &&
        (patch.op !== Operation.MOVE || patch.from === '' || patch.from === '#');
      if (!readsOrReplacesRoot) {
        result = isArray(result) ? result.slice() : copyObject(result);
        cloned.add(result);
        rootUnowned = false;
      }
    }
    const previous = result;
    result = applySinglePatch(result, patch, i, cloned);
    if (result !== previous) rootUnowned = cloned !== null;
  }
  return result as Result;
};
