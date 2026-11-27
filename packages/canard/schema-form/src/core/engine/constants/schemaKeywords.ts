import { DEFAULT_KEYWORDS } from '@winglet/json-schema/keyword';
import type { KeywordKind } from '@winglet/json-schema/keyword';

/**
 * Select the shared vocabulary keywords whose value has one of the given shapes.
 * @param kinds - Keyword kinds to include; dialect membership is ignored
 * @returns Keyword names in vocabulary order
 */
const selectKeywords = (kinds: readonly KeywordKind[]): readonly string[] => {
  const keywords: string[] = [];
  for (const descriptor of DEFAULT_KEYWORDS)
    if (kinds.includes(descriptor.kind)) keywords.push(descriptor.keyword);
  return keywords;
};

/** Keywords holding one subschema, or a tuple of subschemas when the value is an array. */
export const SCHEMA_SINGLE_KEYWORDS = selectKeywords(['schema', 'items']);

/** Keywords holding an ordered list of subschemas. */
export const SCHEMA_LIST_KEYWORDS = selectKeywords(['schemaList']);

/** Keywords mapping names to subschemas. */
export const SCHEMA_MAP_KEYWORDS = selectKeywords(['schemaMap', 'objectMap']);
