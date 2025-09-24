export const FIRST_WIN_FIELDS = [
  'title',
  'description',
  '$comment',
  'examples',
  'default',
  'readOnly',
  'writeOnly',
  'format',
  'additionalProperties',
  'patternProperties',
] as const;

export const SPECIAL_FIELDS = [
  'type',
  'enum',
  'const',
  'required',
  'pattern',
  'multipleOf',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'minProperties',
  'maxProperties',
  'minContains',
  'maxContains',
  'uniqueItems',
  'propertyNames',
  'properties',
  'items',
] as const;

export const IGNORE_FIELDS = [
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'if',
  'then',
  'else',
  'dependencies',
  'dependentRequired',
  'dependentSchemas',
  'unevaluatedProperties',
  'unevaluatedItems',
  'contains',
] as const;

export const EXCLUDE_FIELDS = new Set<string>([
  ...FIRST_WIN_FIELDS,
  ...SPECIAL_FIELDS,
  ...IGNORE_FIELDS,
]);
