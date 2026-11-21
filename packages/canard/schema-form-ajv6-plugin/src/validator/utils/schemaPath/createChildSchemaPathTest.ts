import type { SchemaResource } from './collectSchemaResources';
import { isChildSchemaPath } from './isChildSchemaPath';

/**
 * Creates the false-schema classifier for one compiled root that declares resources.
 * A path inside a resource must first be rebased onto it; one compiled validator reports the same
 * constant paths on every run, so each path is classified once and reused. A root without
 * resources uses `isChildSchemaPath` directly instead.
 * @param resources - Resources or their lazy supplier, evaluated only for nonlocal schema paths.
 * @returns A function that tells whether a `false schema` issue's schema path places one child
 *   of its host (see `isChildSchemaPath`).
 */
export const createChildSchemaPathTest = (resources: readonly SchemaResource[] | (() => readonly SchemaResource[])) => {
  let results: Map<string, boolean> | undefined;
  return (schemaPath: string): boolean => {
    const cache = results ??= new Map<string, boolean>();
    let result = cache.get(schemaPath);
    if (result === undefined) {
      result = schemaPath.startsWith('#/')
        ? isChildSchemaPath(schemaPath)
        : isChildSchemaPath(schemaPath, typeof resources === 'function' ? resources() : resources);
      cache.set(schemaPath, result);
    }
    return result;
  };
};
