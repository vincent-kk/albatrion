/**
 * JSON Patch operation names defined by RFC 6902 section 4.
 *
 * Declared as a const object rather than a TypeScript `enum` so the values survive
 * `isolatedModules` erasure and can be compared against parsed JSON at runtime.
 */
export const Operation = {
  ADD: 'add',
  REPLACE: 'replace',
  REMOVE: 'remove',
  MOVE: 'move',
  COPY: 'copy',
  TEST: 'test',
} as const;

/** Union of the operation names carried by a patch's `op` field. */
export type Operation = (typeof Operation)[keyof typeof Operation];
