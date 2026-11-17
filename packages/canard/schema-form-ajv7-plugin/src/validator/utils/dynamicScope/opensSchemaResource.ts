/**
 * Whether a schema object starts a new resource: it carries a string `$id` that is not a bare fragment.
 * @param schema - A schema object, never a name map or an array.
 * @returns True when references inside it resolve against its own base URI.
 */
export const opensSchemaResource = (schema: object): boolean =>
  '$id' in schema && typeof schema.$id === 'string' && !schema.$id.startsWith('#');
