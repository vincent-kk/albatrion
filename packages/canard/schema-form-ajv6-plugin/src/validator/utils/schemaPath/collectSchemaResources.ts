import type { Dictionary } from '@aileron/declare';

/** A subschema that declares its own `$id`; AJV6 starts the schema paths inside it with the reference to it. */
export interface SchemaResource {
  /** The `$id` exactly as authored. */
  id: string;
  /** The subschema that declares the id. */
  schema: object;
}

/**
 * Appends every subschema under `value` that declares a non-empty string `$id`; appending is its purpose.
 * @param value - Any JSON value of the schema tree; primitives end the walk.
 * @param resources - Accumulator that receives the resources in document order.
 */
const pushResources = (value: unknown, resources: SchemaResource[]): void => {
  if (typeof value !== 'object' || value === null) return;
  const id = (value as Dictionary<unknown>).$id;
  if (typeof id === 'string' && id !== '') resources.push({ id, schema: value });
  for (const key in value) pushResources((value as Dictionary<unknown>)[key], resources);
};

/**
 * Collects the resources of one compiled schema, once per validator.
 * @param root - The schema AJV compiled; a JSON tree, so the walk ends.
 * @returns The resources ordered by id length, longest first, so the first id that starts a path
 *   is its most specific base when one id extends another.
 */
export const collectSchemaResources = (root: object): SchemaResource[] => {
  const resources: SchemaResource[] = [];
  pushResources(root, resources);
  return resources.sort((left, right) => right.id.length - left.id.length);
};
