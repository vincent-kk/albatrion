import {
  SCHEMA_ARRAY_KEYWORDS,
  SCHEMA_DICTIONARY_KEYWORDS,
  SCHEMA_VALUE_KEYWORDS,
} from './schemaKeywords';

/** Keywords a walk can refuse to enter. */
const NO_SKIPPED_KEYWORDS: ReadonlySet<string> = new Set();

/**
 * Visit the schema objects under a schema in document order, descending only through subschema keywords.
 * Data keywords (`const`, `enum`, `default`, `examples`), annotations and unknown keywords are never entered.
 * @param schema - The schema to walk; booleans and other non-objects visit nothing.
 * @param visit - Receives each schema object, its JSON Pointer from the origin and its ancestors (origin first); returns whether to descend into it.
 * @param skipKeywords - Subschema keywords not to enter.
 * @param pointer - The JSON Pointer of `schema` relative to the walk's origin.
 * @param ancestors - The schema objects enclosing `schema`, origin first.
 */
export const visitSchemaObjects = (
  schema: unknown,
  visit: (schema: object, pointer: string, ancestors: readonly object[]) => boolean,
  skipKeywords: ReadonlySet<string> = NO_SKIPPED_KEYWORDS,
  pointer = '',
  ancestors: readonly object[] = [],
): void => {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) return;
  if (!visit(schema, pointer, ancestors)) return;
  const inner = [...ancestors, schema];
  for (const [keyword, value] of Object.entries(schema)) {
    if (skipKeywords.has(keyword)) continue;
    const at = `${pointer}/${keyword.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    if (Array.isArray(value)) {
      if (SCHEMA_ARRAY_KEYWORDS.has(keyword))
        value.forEach((item, index) => visitSchemaObjects(item, visit, skipKeywords, `${at}/${index}`, inner));
    } else if (SCHEMA_VALUE_KEYWORDS.has(keyword)) {
      visitSchemaObjects(value, visit, skipKeywords, at, inner);
    } else if (SCHEMA_DICTIONARY_KEYWORDS.has(keyword) && typeof value === 'object' && value !== null) {
      for (const [name, item] of Object.entries(value))
        visitSchemaObjects(item, visit, skipKeywords, `${at}/${name.replace(/~/g, '~0').replace(/\//g, '~1')}`, inner);
    }
  }
};
