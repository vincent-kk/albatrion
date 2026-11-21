import type { SchemaResource } from './collectSchemaResources';

/** Character code of `/`. */
const SLASH = 47;
/** Character code of `#`. */
const HASH = 35;

/**
 * Rebases an AJV6 schema path that starts with a declared `$id` onto that resource.
 * AJV6 writes a path inside another resource as the reference string followed by the path inside
 * its target: `<id>/<pointer>` for a reference to the resource, `<id>#/<pointer>` for a fragment
 * reference into it. A reference spelled differently from the authored `$id` matches nothing.
 * @param schemaPath - A path that does not start with `#/`.
 * @param resources - Resources of the compiled schema, longest id first.
 * @returns The resource's schema and a `#/` pointer inside it, or undefined when no declared id
 *   starts the path.
 */
export const localizeSchemaPath = (
  schemaPath: string,
  resources: readonly SchemaResource[],
): { schema: object; pointer: string } | undefined => {
  for (const { id, schema } of resources) {
    if (!schemaPath.startsWith(id)) continue;
    const next = schemaPath.charCodeAt(id.length);
    if (next === SLASH) return { schema, pointer: `#${schemaPath.slice(id.length)}` };
    if (next === HASH && schemaPath.charCodeAt(id.length + 1) === SLASH)
      return { schema, pointer: schemaPath.slice(id.length) };
  }
  return undefined;
};
