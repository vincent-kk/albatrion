/**
 * Detects potential prototype pollution attempts in JSON Patch paths.
 * Checks for dangerous property names like "__proto__" and "constructor.prototype".
 *
 * @param key - The current path segment
 * @param keys - The full path segments array
 * @param index - The current segment index
 * @returns True if the modification could affect prototype chain
 * @internal
 */
export const isPrototypeModification = (
  key: string | number,
  keys: string[],
  index: number,
): boolean =>
  key === '__proto__' ||
  (key === 'prototype' && index > 0 && keys[index - 1] === 'constructor');
