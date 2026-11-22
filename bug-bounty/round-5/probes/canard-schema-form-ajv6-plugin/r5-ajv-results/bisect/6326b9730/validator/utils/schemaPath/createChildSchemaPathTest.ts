import type { SchemaResource } from './collectSchemaResources';
import { isChildSchemaPath } from './isChildSchemaPath';

/**
 * Creates the false-schema classifier for one compiled root that declares resources.
 * A path inside a resource must first be rebased onto it; one compiled validator reports the same
 * constant paths on every run, so each path is classified once and reused. A root without
 * resources uses `isChildSchemaPath` directly instead.
 * @param resources - Resources of the compiled schema, longest id first (see `collectSchemaResources`).
 * @returns A function that tells whether a `false schema` issue's schema path places one child
 *   of its host (see `isChildSchemaPath`).
 */
export const createChildSchemaPathTest = (resources: readonly SchemaResource[]) => {
  const results = new Map<string, boolean>();
  return (schemaPath: string): boolean => {
    let result = results.get(schemaPath);
    if (result === undefined) {
      result = isChildSchemaPath(schemaPath, resources);
      results.set(schemaPath, result);
    }
    return result;
  };
};
