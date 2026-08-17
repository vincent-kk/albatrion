/**
 * Fields that follow the "first-win" strategy during schema intersection.
 *
 * These fields preserve the base schema's value when both base and source
 * have values defined. Typically used for metadata and descriptive fields
 * where the first schema's information takes precedence.
 */
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
  'prefixItems',
] as const;

/**
 * Fields that require special intersection logic and are handled by dedicated functions.
 *
 * These fields have custom intersection rules (e.g., enum intersection, minimum/maximum
 * selection, etc.) and are processed separately from the general field copying logic.
 */
export const SPECIAL_FIELDS = [
  'type',
  'enum',
  'const',
  'required',
  'nullable',
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

/**
 * Fields that are ignored during the intersection process.
 *
 * These fields represent complex schema composition and conditional logic
 * that cannot be simply merged and are handled separately in the overall
 * schema processing pipeline.
 */
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

/**
 * Set of all fields that are excluded from the general overwrite processing.
 *
 * This combines first-win fields, special fields, and ignored fields to create
 * a comprehensive exclusion list for the processOverwriteFields function.
 * Fields in this set are handled by dedicated processing functions.
 */
export const EXCLUDE_FIELDS = new Set<string>([
  ...FIRST_WIN_FIELDS,
  ...SPECIAL_FIELDS,
  ...IGNORE_FIELDS,
]);
