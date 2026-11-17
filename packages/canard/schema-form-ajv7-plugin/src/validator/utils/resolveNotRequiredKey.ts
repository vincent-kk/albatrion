import type { Dictionary } from '@aileron/declare';

/**
 * Finds the key a single-key `not: { required: [key] }` rejects.
 * @param root - Authored root the schema path is resolved against.
 * @param schemaPath - The `not` issue's path; only a `#/` fragment is local to the root.
 * @returns The single required name, or undefined when the path is not local, names no schema,
 *   or the negated schema requires zero or several names.
 */
export const resolveNotRequiredKey = (root: object, schemaPath: string): string | undefined => {
  if (!schemaPath.startsWith('#/')) return undefined;
  let target: unknown = root;
  for (const part of schemaPath.slice(2).split('/')) {
    if (typeof target !== 'object' || target === null) return undefined;
    // AJV percent-encodes each fragment segment after JSON Pointer escaping; undo in reverse order.
    const segment = part.includes('%') ? decodeURIComponent(part) : part;
    target = (target as Dictionary<unknown>)[
      segment.includes('~') ? segment.replace(/~1/g, '/').replace(/~0/g, '~') : segment
    ];
  }
  if (typeof target !== 'object' || target === null) return undefined;
  const required = (target as Dictionary<unknown>).required;
  return Array.isArray(required) && required.length === 1 && typeof required[0] === 'string'
    ? required[0]
    : undefined;
};
