import { opensSchemaResource } from './opensSchemaResource';
import { visitSchemaObjects } from './visitSchemaObjects';

/**
 * Collect the dynamic anchors one resource declares, without entering nested resources or the guard.
 * Declarations inside the guard bind only as ancestors of a reference (`findUnboundGuardReferences`).
 * A string `$dynamicAnchor` counts anywhere in the resource; `$recursiveAnchor: true` counts only at its root, under `''`.
 * @param resource - The resource's root schema object.
 * @param guard - The guard schema, whose subtree is not scanned.
 * @returns The JSON Pointer, relative to the resource root, of the first declaration of each name in document order.
 */
export const collectResourceAnchors = (resource: object, guard: unknown): Map<string, string> => {
  const anchors = new Map<string, string>();
  visitSchemaObjects(resource, (schema, pointer) => {
    if (schema === guard || (schema !== resource && opensSchemaResource(schema))) return false;
    if ('$dynamicAnchor' in schema && typeof schema.$dynamicAnchor === 'string' && !anchors.has(schema.$dynamicAnchor))
      anchors.set(schema.$dynamicAnchor, pointer);
    if (schema === resource && '$recursiveAnchor' in schema && schema.$recursiveAnchor === true && !anchors.has(''))
      anchors.set('', pointer);
    return true;
  });
  return anchors;
};
