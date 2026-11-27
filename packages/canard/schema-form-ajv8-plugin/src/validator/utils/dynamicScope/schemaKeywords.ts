/** Keywords whose object value is one subschema (`items` also takes an array, see `SCHEMA_ARRAY_KEYWORDS`). */
export const SCHEMA_VALUE_KEYWORDS: ReadonlySet<string> = new Set([
  'if',
  'then',
  'else',
  'not',
  'items',
  'additionalItems',
  'additionalProperties',
  'contains',
  'propertyNames',
  'unevaluatedItems',
  'unevaluatedProperties',
]);

/** Keywords whose array value lists subschemas. */
export const SCHEMA_ARRAY_KEYWORDS: ReadonlySet<string> = new Set([
  'allOf',
  'anyOf',
  'oneOf',
  'prefixItems',
  'items',
]);

/** Keywords whose object value maps names to subschemas; values that are not objects are skipped. */
export const SCHEMA_DICTIONARY_KEYWORDS: ReadonlySet<string> = new Set([
  'properties',
  'patternProperties',
  '$defs',
  'definitions',
  'dependentSchemas',
  'dependencies',
]);
