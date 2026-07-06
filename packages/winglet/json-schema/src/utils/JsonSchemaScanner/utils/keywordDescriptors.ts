import {
  $DEFS,
  ADDITIONAL_PROPERTIES,
  COMPOSITION_KEYWORDS,
  CONDITIONAL_KEYWORDS,
  DEFINITIONS,
  ITEMS,
  type KeywordDescriptor,
  PREFIX_ITEMS,
  PROPERTIES,
} from '../type';

export type { KeywordDescriptor, KeywordKind } from '../type';

/**
 * The built-in traversal vocabulary. Order is significant — it fixes the order
 * in which child subschemas are discovered (and therefore visited) and MUST NOT
 * change, as it defines the scanner's observable traversal sequence.
 */
export const DEFAULT_KEYWORDS: readonly KeywordDescriptor[] = [
  { keyword: $DEFS, kind: 'schemaMap' },
  { keyword: DEFINITIONS, kind: 'schemaMap' },
  { keyword: ADDITIONAL_PROPERTIES, kind: 'schema' },
  { keyword: CONDITIONAL_KEYWORDS[0], kind: 'schema' }, // not
  { keyword: CONDITIONAL_KEYWORDS[1], kind: 'schema' }, // if
  { keyword: CONDITIONAL_KEYWORDS[2], kind: 'schema' }, // then
  { keyword: CONDITIONAL_KEYWORDS[3], kind: 'schema' }, // else
  { keyword: COMPOSITION_KEYWORDS[0], kind: 'schemaList' }, // allOf
  { keyword: COMPOSITION_KEYWORDS[1], kind: 'schemaList' }, // anyOf
  { keyword: COMPOSITION_KEYWORDS[2], kind: 'schemaList' }, // oneOf
  { keyword: PREFIX_ITEMS, kind: 'items' },
  { keyword: ITEMS, kind: 'items' },
  { keyword: PROPERTIES, kind: 'objectMap' },
];

/**
 * Additional draft 2019-09 / 2020-12 applicator keywords that the built-in
 * vocabulary intentionally does NOT traverse by default (to preserve existing
 * observable behaviour). Pass via `options.additionalKeywords` to opt in:
 *
 * ```ts
 * new JsonSchemaScanner({ options: { additionalKeywords: EXTENDED_KEYWORDS } });
 * ```
 *
 * `dependencies` (draft-07, whose values may be either a schema or a string[])
 * is deliberately excluded because its array form is not a subschema.
 */
export const EXTENDED_KEYWORDS: readonly KeywordDescriptor[] = [
  { keyword: 'patternProperties', kind: 'schemaMap' },
  { keyword: 'dependentSchemas', kind: 'schemaMap' },
  { keyword: 'propertyNames', kind: 'schema' },
  { keyword: 'contains', kind: 'schema' },
  { keyword: 'additionalItems', kind: 'schema' },
  { keyword: 'unevaluatedProperties', kind: 'schema' },
  { keyword: 'unevaluatedItems', kind: 'schema' },
  { keyword: 'contentSchema', kind: 'schema' },
];
