import type { Dictionary } from '@aileron/declare';

/**
 * Deletes a property with plain `delete` semantics, as the deletion
 * counterpart of the data-property primitives.
 *
 * `delete` only ever removes own properties, so a reserved member name
 * (`__proto__`, `constructor`, `prototype`) never removes an inherited member
 * from the prototype chain — the primitive exists so reserved-member call
 * sites can stay on one access contract. Like the `delete` operator, deleting
 * a non-configurable own property throws in strict mode.
 *
 * @param target - Object or array to delete from
 * @param key - Property key to delete
 * @returns The `delete` operator result: `true` unless the own property could
 *          not be removed
 *
 * @example
 * Reserved member names never touch inherited members:
 * ```typescript
 * import { deleteDataProperty } from '@winglet/common-utils';
 *
 * deleteDataProperty({}, 'constructor'); // true
 * ({}).constructor === Object; // true (inherited member untouched)
 * ```
 */
export const deleteDataProperty = (
  target: Dictionary | Array<any>,
  key: string,
): boolean => delete (target as Dictionary)[key];
