const __hasOwnProperty__ = Object.prototype.hasOwnProperty;

/**
 * Safely checks if an object has its own (non-inherited) property.
 *
 * Uses Object.prototype.hasOwnProperty.call() to avoid prototype pollution
 * and ensure accurate own-property detection, even for objects without
 * Object.prototype in their prototype chain.
 *
 * @typeParam Type - Type of the inspected value, whose keys the guard narrows to
 * @param value - Object or value to inspect
 * @param key - Property key to check for ownership
 * @returns Whether `key` is an own property, narrowing it to `keyof Type`
 *
 * @example
 * Own property detection:
 * ```typescript
 * import { hasOwnProperty } from '@winglet/common-utils';
 *
 * const obj = { name: 'John', age: 30 };
 * console.log(hasOwnProperty(obj, 'name')); // true
 * console.log(hasOwnProperty(obj, 'toString')); // false (inherited)
 *
 * const nullObj = Object.create(null);
 * nullObj.prop = 'value';
 * console.log(hasOwnProperty(nullObj, 'prop')); // true (safe even without prototype)
 * ```
 */
export const hasOwnProperty = <Type>(
  value: Type,
  key: PropertyKey,
): key is keyof Type => __hasOwnProperty__.call(value, key);
