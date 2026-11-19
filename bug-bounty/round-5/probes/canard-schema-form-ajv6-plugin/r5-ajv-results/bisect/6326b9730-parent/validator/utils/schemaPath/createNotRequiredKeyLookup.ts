import type { Dictionary } from '@aileron/declare';

import type { SchemaResource } from './collectSchemaResources';
import { localizeSchemaPath } from './localizeSchemaPath';

/**
 * Resolves the subschema at an AJV6 schema path.
 * @param root - The compiled schema a `#/` path is resolved against.
 * @param resources - Resources of the compiled schema, longest id first; a path that starts with
 *   one of their ids is resolved inside that resource.
 * @param schemaPath - AJV6 percent-encodes each segment after JSON Pointer escaping, so a segment
 *   is decoded in that order.
 * @returns The subschema, or undefined when the path matches no resource or names no schema.
 */
const schemaAt = (root: object, resources: readonly SchemaResource[], schemaPath: string): unknown => {
  const local = schemaPath.startsWith('#/') ? { schema: root, pointer: schemaPath } : localizeSchemaPath(schemaPath, resources);
  if (!local) return undefined;
  let target: unknown = local.schema;
  for (const part of local.pointer.slice(2).split('/')) {
    if (typeof target !== 'object' || target === null) return undefined;
    const segment = part.includes('%') ? decodeURIComponent(part) : part;
    target = (target as Dictionary<unknown>)[segment.includes('~') ? segment.replace(/~1/g, '/').replace(/~0/g, '~') : segment];
  }
  return target;
};

/**
 * Creates the rejected-key lookup for the `not` issues of one compiled root.
 * One compiled validator reports the same constant schema paths on every run, so each path is
 * resolved once and reused.
 * @param root - The schema object AJV compiled, never the caller's object, so a later mutation by
 *   the caller cannot name a key the validator did not enforce.
 * @param resources - Resources of `root`, longest id first (see `collectSchemaResources`).
 * @returns A function from a `not` issue's schema path to the one name its `required` lists, or
 *   undefined when the schema requires no single string name.
 */
export const createNotRequiredKeyLookup = (root: object, resources: readonly SchemaResource[]) => {
  const keys = new Map<string, string | null>();
  return (schemaPath: string): string | undefined => {
    let key = keys.get(schemaPath);
    if (key === undefined) {
      const schema = schemaAt(root, resources, schemaPath);
      const required = typeof schema === 'object' && schema !== null ? (schema as Dictionary<unknown>).required : null;
      key = Array.isArray(required) && required.length === 1 && typeof required[0] === 'string' ? required[0] : null;
      keys.set(schemaPath, key);
    }
    return key ?? undefined;
  };
};
