import { isEmptyObject } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

/**
 * Reconciles an object by merging input into the target with configurable behavior.
 *
 * This utility handles object updates with two modes:
 * - **Normal mode** (`additive: false`): Allows both setting and unsetting values
 * - **Additive mode** (`additive: true`): Only allows setting truthy values (ignores falsy)
 *
 * @param base - The current object to be modified (mutated in place)
 * @param input - The input to merge. Can be:
 *   - `undefined`: Clears all properties (returns `{}` if target was non-empty, `undefined` if already empty)
 *   - A function `(prev) => newObject`: Called with a shallow copy of current target
 *   - An object: Merged into target according to the mode
 * @param additive - When `true`, only truthy values are applied (falsy values ignored).
 *                   When `false` (default), all values are applied and `undefined` removes keys.
 *
 * @returns
 *   - `undefined` if no changes were made (target unchanged)
 *   - `{}` if target was cleared via `undefined` input
 *   - A new shallow copy of the modified target if changes occurred
 *
 * @remarks
 * - The original `target` object IS mutated during processing
 * - A new object reference is returned only when changes occur (for immutability in consumers)
 * - In additive mode, existing truthy values cannot be overwritten with falsy values
 * - In normal mode, setting a key to `undefined` removes it from target
 *
 * @example
 * // Normal mode - set and unset values
 * const obj = { dirty: true };
 * shallowPatch(obj, { dirty: undefined, touched: true });
 * // Returns: { touched: true }
 *
 * @example
 * // Additive mode - only truthy values applied
 * const obj = { dirty: true };
 * shallowPatch(obj, { dirty: false, touched: true }, true);
 * // Returns: { dirty: true, touched: true } (dirty: false ignored)
 *
 * @example
 * // Clear all properties
 * const obj = { dirty: true, touched: true };
 * shallowPatch(obj, undefined);
 * // Returns: {}
 *
 * @example
 * // No changes - returns undefined
 * const obj = { dirty: true };
 * shallowPatch(obj, { dirty: true });
 * // Returns: undefined (no change)
 */
export const shallowPatch = <Dict extends Dictionary>(
  base: Dict,
  input?: ((prev: Dict) => Dict) | Dict,
  additive: boolean = false,
): Dict | void => {
  const patch = typeof input === 'function' ? input({ ...base }) : input;

  // Clear all properties when input is undefined
  if (patch === undefined) return isEmptyObject(base) ? void 0 : ({} as Dict);

  // Invalid input - no changes
  if (patch === null || typeof patch !== 'object') return void 0;

  let idle = true;
  const result = { ...base };
  const keys = Object.keys(patch);

  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = patch[k];

    if (additive) {
      // Additive mode: only apply truthy values that differ from current
      if (value && result[k] !== value) {
        result[k as keyof Dict] = value;
        if (idle) idle = false;
      }
    } else {
      // Normal mode: handle undefined (delete) and value changes
      if (value === undefined) {
        if (k in result) {
          delete result[k];
          if (idle) idle = false;
        }
      } else if (result[k] !== value) {
        result[k as keyof Dict] = value;
        if (idle) idle = false;
      }
    }
  }

  // Return undefined if no changes, otherwise return new object reference
  if (idle) return;
  return result;
};
