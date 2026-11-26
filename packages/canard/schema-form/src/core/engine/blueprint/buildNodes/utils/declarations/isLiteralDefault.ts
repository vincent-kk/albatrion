import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Recognize finite literal data without evaluating getters or copying its values.
 * @param value - Authored default whose descendants must also be literal data
 * @param active - Current object ancestry, allocated only for container defaults
 * @returns Whether the value is finite JSON data without executable members or array holes
 */
export const isLiteralDefault = (
  value: unknown,
  active?: WeakSet<object>,
): boolean => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  if (!isArray(value) && prototype !== Object.prototype && prototype !== null)
    return false;
  active ??= new WeakSet();
  if (active.has(value)) return false;
  active.add(value);
  // A hole would be the only item position the static-first loader leaves without a value; an
  // array's other own properties neither hide nor fake one.
  if (isArray(value))
    for (let index = 0; index < value.length; index++)
      if (!hasOwnProperty(value, index)) return false;
  const keys = Object.keys(value);
  for (let index = 0; index < keys.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, keys[index]);
    if (
      !descriptor ||
      !('value' in descriptor) ||
      !isLiteralDefault(descriptor.value, active)
    )
      return false;
  }
  active.delete(value);
  return true;
};
