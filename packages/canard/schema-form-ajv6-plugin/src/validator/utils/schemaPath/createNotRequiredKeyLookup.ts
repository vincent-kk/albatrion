import type { Dictionary } from '@aileron/declare';

/**
 * Resolves the authored subschema at an AJV6 schema path.
 * @param root - Authored root the path is resolved against.
 * @param schemaPath - Only a `#` path is local to the root. AJV6 percent-encodes each fragment
 *   segment after JSON Pointer escaping, so a segment is decoded in that order.
 * @returns The subschema, or undefined when the path leaves the root or names no schema.
 */
const schemaAt = (root: object, schemaPath: string): unknown => {
  if (!schemaPath.startsWith('#')) return undefined;
  let target: unknown = root;
  for (const part of schemaPath.slice(2).split('/')) {
    if (typeof target !== 'object' || target === null) return undefined;
    const segment = part.includes('%') ? decodeURIComponent(part) : part;
    target = (target as Dictionary<unknown>)[segment.includes('~') ? segment.replace(/~1/g, '/').replace(/~0/g, '~') : segment];
  }
  return target;
};

/**
 * Creates the rejected-key lookup for the `not` issues of one compiled root.
 * One compiled validator reports the same constant schema paths on every run, so each path is
 * resolved once and reused; the root is read as it stood at its first lookup.
 * @param root - Authored root of the compiled validator.
 * @returns A function from a `not` issue's schema path to the one name its `required` lists, or
 *   undefined when the schema requires no single string name.
 */
export const createNotRequiredKeyLookup = (root: object) => {
  const keys = new Map<string, string | null>();
  return (schemaPath: string): string | undefined => {
    let key = keys.get(schemaPath);
    if (key === undefined) {
      const schema = schemaAt(root, schemaPath);
      const required = typeof schema === 'object' && schema !== null ? (schema as Dictionary<unknown>).required : null;
      key = Array.isArray(required) && required.length === 1 && typeof required[0] === 'string' ? required[0] : null;
      keys.set(schemaPath, key);
    }
    return key ?? undefined;
  };
};
