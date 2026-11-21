import type { Dictionary } from '@aileron/declare';

/** A subschema that declares its own identifier; AJV6 starts the schema paths inside it with the reference to it. */
export interface SchemaResource {
  /** The identifier exactly as authored. */
  id: string;
  /** The subschema that declares the identifier. */
  schema: object;
}

/**
 * Keywords the walk treats specially in schema position: `data` values (`const`, `enum`, `examples`,
 * `default`) are never searched, so an id-shaped object inside them identifies nothing; `names`
 * values map names to schemas, so every key inside them is a name, never a keyword.
 */
const KEYWORD_ROLES = new Map<string, 'data' | 'names'>([
  ['const', 'data'], ['enum', 'data'], ['examples', 'data'], ['default', 'data'],
  ['properties', 'names'], ['patternProperties', 'names'], ['definitions', 'names'], ['dependencies', 'names'],
]);

/**
 * Appends every subschema under `node` that declares a non-empty string identifier; appending is its purpose.
 * It runs on every compile over freshly parsed objects, where an indexed `Object.keys` loop is
 * about three times faster than `for...in`, and primitive members end the walk without a call.
 * @param node - An object or array of the schema tree.
 * @param inNameMap - Whether `node` maps names to schemas; its keys are then walked unfiltered,
 *   so a field named `default` or `enum` is still a schema, and the map itself declares no identifier.
 * @param legacyId - Whether the bound Ajv also reads draft-04 `id` (`schemaId` `'id'` or `'auto'`);
 *   `$id` wins when both are present, as in AJV6's own lookup.
 * @param resources - Accumulator that receives the resources in document order.
 */
const pushResources = (node: Dictionary<unknown>, inNameMap: boolean, legacyId: boolean, resources: SchemaResource[]): void => {
  const id = inNameMap ? undefined : typeof node.$id === 'string' ? node.$id : legacyId ? node.id : undefined;
  if (typeof id === 'string' && id !== '') resources.push({ id, schema: node });
  const keys = Object.keys(node);
  for (let index = 0; index < keys.length; index++) {
    const child = node[keys[index]];
    if (typeof child !== 'object' || child === null) continue;
    const role = inNameMap ? undefined : KEYWORD_ROLES.get(keys[index]);
    if (role !== 'data') pushResources(child as Dictionary<unknown>, role === 'names', legacyId, resources);
  }
};

/**
 * Collects the resources of one compiled schema, once per validator.
 * @param root - The schema AJV compiled; a JSON tree, so the walk ends.
 * @param legacyId - Whether the bound Ajv treats draft-04 `id` as an identifier.
 * @returns The resources ordered by id length, longest first, so the first id that starts a path
 *   is its most specific base when one id extends another.
 */
export const collectSchemaResources = (root: object, legacyId: boolean): SchemaResource[] => {
  const resources: SchemaResource[] = [];
  pushResources(root as Dictionary<unknown>, false, legacyId, resources);
  return resources.sort((left, right) => right.id.length - left.id.length);
};
