/** A schema resource with its authored identifier. */
export interface SchemaResource {
  /** Identifier as emitted in a native reference path. */
  id: string;
  /** Subschema that owns the identifier. */
  schema: object;
}

/** Values containing annotations or instance data. */
const DATA_KEYWORDS = new Set(['const', 'enum', 'examples', 'default']);
/** Containers whose keys are always authored names. */
const NAME_MAPS = new Set(['properties', 'patternProperties', 'definitions', 'dependencies']);

/**
 * Collects local resource roots from the compiled schema.
 * @param root - Compiled JSON schema object.
 * @param schemaId - AJV's identifier selection option.
 * @returns Resource roots, in longest identifier order.
 */
export const collectSchemaResources = (root: object, schemaId: string | undefined): SchemaResource[] => {
  const resources: SchemaResource[] = [];
  const pending = [{ schema: root, isNameMap: false }];
  for (const { schema, isNameMap } of pending) {
    if (!isNameMap) {
      const id: unknown = schemaId === 'id' ? Reflect.get(schema, 'id')
        : Reflect.get(schema, '$id') ?? (schemaId === 'auto' ? Reflect.get(schema, 'id') : undefined);
      if (typeof id === 'string' && id) resources.push({ id, schema });
    }
    for (const [name, child] of Object.entries(schema))
      if ((isNameMap || !DATA_KEYWORDS.has(name)) && typeof child === 'object' && child !== null)
        pending.push({ schema: child, isNameMap: !isNameMap && NAME_MAPS.has(name) });
  }
  return resources.sort((left, right) => right.id.length - left.id.length);
};
