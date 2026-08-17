import type { Dictionary } from '@aileron/declare';

import { isReservedName } from './utils/isReservedName';

/**
 * Writes a property while treating reserved member names as opaque own data.
 *
 * For the reserved member names (`__proto__`, `constructor`, `prototype`) the
 * value is defined as an enumerable, writable, configurable own data property,
 * so the inherited `__proto__` setter is never triggered and the target's
 * prototype never changes. Every other key behaves exactly like plain
 * assignment, including array index assignment, with no extra cost beyond the
 * name check.
 *
 * @param target - Object or array to write to
 * @param key - Property key to write
 * @param value - Value to store as the property
 *
 * @example
 * Writing `__proto__` creates data instead of swapping the prototype:
 * ```typescript
 * import { setDataProperty } from '@winglet/common-utils';
 *
 * const target = {};
 * setDataProperty(target, '__proto__', { x: 1 });
 * Object.getOwnPropertyDescriptor(target, '__proto__')?.value; // { x: 1 }
 * Object.getPrototypeOf(target) === Object.prototype; // true
 * ```
 */
export const setDataProperty = (
  target: Dictionary | Array<any>,
  key: string,
  value: any,
): void => {
  if (isReservedName(key))
    Object.defineProperty(target, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  else (target as Dictionary)[key] = value;
};
