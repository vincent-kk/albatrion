/**
 * Keywords whose next path segment is an authored name rather than a keyword. Index-taking keywords
 * (`allOf`, `anyOf`, `oneOf`) are left out: a digit segment never spells a keyword.
 */
const NAMED_KEYWORDS = ['properties', 'patternProperties', 'definitions', '$defs', 'dependencies', 'dependentSchemas'];
/** Keywords whose subschema judges one child of the host object or array. */
const CHILD_KEYWORDS = ['properties', 'patternProperties', 'items'];
/** A tuple `items` entry index. */
const INDEX = /^\d+$/;

/**
 * Tells whether a false schema stands where its host places one child, so the issue rejects that key.
 *
 * The path is walked from the root, so a property named like a keyword (`items`, `properties`)
 * is read as a name, never as the keyword it spells.
 *
 * @param schemaPath - The false schema's path; AJV7 always ends it with a `false schema` segment.
 * @returns True when the false schema is `properties/<name>`, `patternProperties/<pattern>`,
 *   `items/<index>` or a single `items`; false for an in-place applicator such as `then`,
 *   `allOf/<index>`, `dependencies/<name>` or an inlined `$ref` target under `definitions`.
 */
export const isChildSchemaPath = (schemaPath: string): boolean => {
  const segments = schemaPath.split('/');
  const end = segments.length - 1;
  let child = false;
  let i = 1;
  while (i < end) {
    const keyword = segments[i];
    const named = NAMED_KEYWORDS.includes(keyword) || (keyword === 'items' && INDEX.test(segments[i + 1]));
    child = CHILD_KEYWORDS.includes(keyword);
    i += named ? 2 : 1;
  }
  return child && i === end;
};
