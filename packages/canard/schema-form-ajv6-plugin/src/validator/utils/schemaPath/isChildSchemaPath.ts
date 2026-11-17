import type { SchemaResource } from './collectSchemaResources';
import { localizeSchemaPath } from './localizeSchemaPath';

/** Keywords whose next segment names one child of the host, so a schema there judges that child. */
const CHILD_MAP = 'properties|patternProperties';
/** Keywords whose next segment names or indexes a subschema that judges the host itself. */
const HOST_MAP = 'allOf|anyOf|oneOf|definitions|dependencies';
/** A single `items` schema, or a tuple entry when an index follows. */
const ITEMS = 'items(?:/[0-9]+)?';
/**
 * Parses a `#/` path one keyword step at a time and accepts when the last step places a child.
 * Any other keyword's segment may neither spell a map keyword nor start with a digit, so a path
 * has exactly one parse: a property named like a keyword stays a name, and no backtracking blows up.
 */
const CHILD_POSITION = new RegExp(
  `^#(?:/(?:(?:${CHILD_MAP}|${HOST_MAP})/[^/]*|${ITEMS}|(?!(?:${CHILD_MAP}|${HOST_MAP}|items)(?:/|$)|[0-9])[^/]*))*?` +
    `/(?:(?:${CHILD_MAP})/[^/]*|${ITEMS})(?:/false schema)?$`,
);
/** Suffix AJV6 appends to the schema path of a `false schema` issue. */
const FALSE_SCHEMA_SUFFIX = '/false schema';

/**
 * Classifies by the last two segments when the pointer's start is unknown.
 * @param path - Schema path rooted at a reference that matches no declared `$id`.
 * @returns True at `<properties|patternProperties|items>/<name or index>` or a single `items`.
 */
const endsAtChildPosition = (path: string): boolean => {
  const end = path.endsWith(FALSE_SCHEMA_SUFFIX) ? path.length - FALSE_SCHEMA_SUFFIX.length : path.length;
  const nameStart = path.lastIndexOf('/', end - 1) + 1;
  if (path.slice(nameStart, end) === 'items') return true;
  const keyword = path.slice(path.lastIndexOf('/', nameStart - 2) + 1, nameStart - 1);
  return keyword === 'items' || keyword === 'properties' || keyword === 'patternProperties';
};

/**
 * Tells whether a false schema stands where its host places one child, so the issue rejects that key.
 * @param schemaPath - AJV6 schema path of a `false schema` issue, with or without its suffix.
 * @param resources - Resources of the compiled schema, longest id first; omitted when it declares none.
 * @returns True when the schema is a `properties` or `patternProperties` entry, a single `items`
 *   or a tuple `items` entry; false for a schema applied to the value itself, such as `then`,
 *   `allOf/0`, an inlined `$ref` target or `propertyNames`. A `#/` path, or a path that starts
 *   with a declared identifier, is parsed from its resource root, so a property named like a
 *   keyword is read as a name; any other path cannot be split from its base, so only its last two
 *   segments are read.
 */
export const isChildSchemaPath = (schemaPath: string, resources?: readonly SchemaResource[]): boolean => {
  if (schemaPath.startsWith('#/')) return CHILD_POSITION.test(schemaPath);
  const local = resources && localizeSchemaPath(schemaPath, resources);
  return local ? CHILD_POSITION.test(local.pointer) : endsAtChildPosition(schemaPath);
};
