/**
 * Checks whether a key is a reserved member name whose plain property access
 * can reach the prototype chain: `__proto__`, `constructor`, `prototype`.
 *
 * Shared predicate for the data-property primitives: performance-sensitive
 * traversal loops branch on it so only reserved names take the special path
 * (`getDataProperty` / `setDataProperty` / `deleteDataProperty`) while
 * ordinary keys keep plain property access. Exactly these three strings
 * return true — no other key is ever classified as reserved.
 *
 * @param key - Property key to classify
 * @returns Whether the key must go through the data-property special path
 *
 * @example
 * Branching a hot loop on the shared predicate:
 * ```typescript
 * import { getDataProperty, isReservedName } from '@winglet/common-utils';
 *
 * const read = (target: object, key: string) =>
 *   isReservedName(key) ? getDataProperty(target, key) : (target as any)[key];
 * ```
 */
export const isReservedName = (key: string): boolean =>
  key === '__proto__' || key === 'constructor' || key === 'prototype';
