import type { Dictionary } from '@aileron/declare';

import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { isReservedName } from './isReservedName';

/**
 * Reads a property while treating reserved member names as opaque own data.
 *
 * For the reserved member names (`__proto__`, `constructor`, `prototype`) the
 * read never walks the prototype chain: the own data property value is
 * returned when present, `undefined` otherwise. Every other key behaves
 * exactly like plain property access, including ordinary prototype chain
 * lookup and array index access, with no extra cost beyond the name check.
 *
 * @param target - Object or array to read from
 * @param key - Property key to read
 * @returns The property value, or `undefined` for a reserved member name that
 *          is not an own property
 *
 * @example
 * Reserved member names never leak the prototype chain:
 * ```typescript
 * import { getDataProperty } from '@winglet/common-utils';
 *
 * getDataProperty(JSON.parse('{"__proto__":{"x":1}}'), '__proto__'); // { x: 1 }
 * getDataProperty({}, '__proto__'); // undefined (not Object.prototype)
 * getDataProperty({}, 'constructor'); // undefined (not Object)
 * ```
 */
export const getDataProperty = (
  target: Dictionary | Array<any>,
  key: string,
): any =>
  isReservedName(key)
    ? hasOwnProperty(target, key)
      ? (target as Dictionary)[key]
      : undefined
    : (target as Dictionary)[key];
