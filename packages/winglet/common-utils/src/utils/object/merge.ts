import { isArray, isPlainObject } from '@/common-utils/utils/filter';

/**
 * Deeply merges two objects.
 * Properties from the source object overwrite properties of the target object.
 * When both objects have nested objects or arrays, they are merged recursively.
 *
 * @template T - Target object type
 * @template S - Source object type
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged object
 *
 * @example
 * merge({a: 1, b: {c: 2}}, {b: {d: 3}, e: 4}); // {a: 1, b: {c: 2, d: 3}, e: 4}
 * merge({a: [1, 2]}, {a: [3, 4]}); // {a: [1, 2, 3, 4]}
 */
export const merge = <
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(
  target: T,
  source: S,
): T & S => {
  const keys = Object.keys(source) as Array<keyof S>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isArray(sourceValue))
      target[key] = isArray(targetValue)
        ? merge(targetValue, sourceValue)
        : merge([], sourceValue);
    else if (isPlainObject(sourceValue))
      target[key] = isPlainObject(targetValue)
        ? merge(targetValue, sourceValue)
        : merge({}, sourceValue);
    else if (targetValue === undefined || sourceValue !== undefined)
      target[key] = sourceValue;
  }
  return target;
};
