const __hasOwnProperty__ = Object.prototype.hasOwnProperty;

/**
 * Safely checks if an object has its own (non-inherited) property.
 *
 * Uses Object.prototype.hasOwnProperty.call() to avoid prototype pollution
 * and ensure accurate own-property detection, even for objects without
 * Object.prototype in their prototype chain.
 *
 * @param value - Object or value to inspect
 * @param key - Property key to check for ownership
 * @returns Type-safe boolean indicating direct property ownership
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
export const hasOwnProperty = (
  value: unknown,
  key: PropertyKey,
): key is keyof typeof value => __hasOwnProperty__.call(value, key);
