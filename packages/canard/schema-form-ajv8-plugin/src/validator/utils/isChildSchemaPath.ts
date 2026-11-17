/**
 * Keywords whose next path segment is a name the author chose, which may be spelled like a keyword.
 * Index-only applicators (`allOf`, `anyOf`, `oneOf`) are absent: an index never reads as a keyword.
 */
const NAMING_KEYWORDS: ReadonlySet<string> = new Set([
  'properties', 'patternProperties', 'definitions', '$defs', 'dependencies', 'dependentSchemas', 'prefixItems',
]);

/** Keywords whose named subschema, or whose single schema for `items`, judges one child of the host. */
const CHILD_KEYWORDS: ReadonlySet<string> = new Set(['properties', 'patternProperties', 'items', 'prefixItems']);

/** Array-form `items` is followed by an index; single-schema `items` is followed by a keyword. */
const INDEX = /^\d+$/;

/**
 * Tells whether a false schema stands where its host places one child, so the issue rejects that key.
 * The path is read from the left, because a segment is a name only when it follows a naming keyword
 * in keyword position: in `#/properties/items/then` the segment `items` is a field name and `then` is
 * an in-place keyword. A URI prefix before the keyword path (another resource) is read as keywords.
 * @param schemaPath - The false schema's path, with or without AJV's trailing `false schema` segment.
 * @returns True when the path ends on a child name under `properties`, `patternProperties`,
 *   `prefixItems` or array-form `items`, or on single-schema `items`; false for an in-place
 *   applicator such as `then`, `allOf/0` or an inlined `$ref` target, where the value is rejected.
 */
export const isChildSchemaPath = (schemaPath: string): boolean => {
  const segments = schemaPath.split('/');
  const last = segments[segments.length - 1] === 'false schema' ? segments.length - 2 : segments.length - 1;
  let isName = false;
  let nextIsName = false;
  for (let index = 0; index <= last; index++) {
    isName = nextIsName;
    const segment = segments[index];
    nextIsName = !isName && (NAMING_KEYWORDS.has(segment) || (segment === 'items' && INDEX.test(segments[index + 1] ?? '')));
  }
  return isName ? CHILD_KEYWORDS.has(segments[last - 1]) : segments[last] === 'items';
};
