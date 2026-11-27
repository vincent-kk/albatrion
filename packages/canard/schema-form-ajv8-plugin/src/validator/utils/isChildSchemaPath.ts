/** Keywords followed by an authored name or a tuple position. */
const NAMING_KEYWORDS = new Set(['properties', 'patternProperties', 'definitions', 'dependencies', '$defs', 'dependentSchemas', 'prefixItems']);

/**
 * Determines whether a native false-schema path judges one child.
 * @param path - Native path rooted at the containing schema resource.
 * @returns Whether the last location places a child schema.
 */
export const isChildSchemaPath = (path: string): boolean => {
  const segments = path.split('/');
  const last = segments.length - (segments.at(-1) === 'false schema' ? 2 : 1);
  let isName = false;
  for (let index = 1; index < last; index++) {
    const segment = segments[index];
    isName = !isName && (NAMING_KEYWORDS.has(segment) || (segment === 'items' && /^\d+$/.test(segments[index + 1])));
  }
  const keyword = segments[last - Number(isName)];
  return keyword === 'properties' || keyword === 'patternProperties' || keyword === 'items' || keyword === 'prefixItems';
};
