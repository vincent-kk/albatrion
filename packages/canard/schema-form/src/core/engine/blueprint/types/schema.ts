/** Authored schema data; extension values remain opaque until their owner reads them. */
export type BlueprintSchema = Readonly<Record<string, unknown>> | boolean;

/** JSON Schema's seven permitted explicit type names. */
export type SchemaTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

/** Stable runtime kind selected by analysis, including virtual and union nodes. */
export type BlueprintNodeKind =
  | Exclude<SchemaTypeName, 'integer'>
  | 'union'
  | 'virtual';

/** Scalar for ordinary nodes; a shared frozen non-null list for union nodes. */
export type BlueprintSchemaType = SchemaTypeName | readonly SchemaTypeName[];
