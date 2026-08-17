/**
 * Checks whether a key is a reserved member name whose plain property access
 * can reach the prototype chain: `__proto__`, `constructor`, `prototype`.
 *
 * @param key - Property key to classify
 * @returns Whether the key must go through the data-property special path
 */
export const isReservedName = (key: string): boolean =>
  key === '__proto__' || key === 'constructor' || key === 'prototype';
