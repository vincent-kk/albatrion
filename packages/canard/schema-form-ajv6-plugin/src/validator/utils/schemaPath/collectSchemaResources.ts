import type { Dictionary } from '@aileron/declare';

/** A subschema that declares its own identifier; AJV6 starts the schema paths inside it with the reference to it. */
export interface SchemaResource {
  /** The identifier exactly as authored. */
  id: string;
  /** The subschema that declares the identifier. */
  schema: object;
}

/** Keywords whose values are data, not schemas, so an id-shaped member inside them identifies nothing. */
const DATA_KEYWORDS = ['const', 'enum', 'examples', 'default'];

/**
 * Appends every subschema under `value` that declares a non-empty string identifier; appending is its purpose.
 * @param value - Any JSON value of the schema tree; primitives end the walk.
 * @param legacyId - Whether the bound Ajv also reads draft-04 `id` (`schemaId` `'id'` or `'auto'`);
 *   `$id` wins when both are present, as in AJV6's own lookup.
 * @param resources - Accumulator that receives the resources in document order.
 */
const pushResources = (value: unknown, legacyId: boolean, resources: SchemaResource[]): void => {
  if (typeof value !== 'object' || value === null) return;
  const node = value as Dictionary<unknown>;
  const id = typeof node.$id === 'string' ? node.$id : legacyId ? node.id : undefined;
  if (typeof id === 'string' && id !== '') resources.push({ id, schema: value });
  for (const key in node) if (!DATA_KEYWORDS.includes(key)) pushResources(node[key], legacyId, resources);
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
  pushResources(root, legacyId, resources);
  return resources.sort((left, right) => right.id.length - left.id.length);
};
