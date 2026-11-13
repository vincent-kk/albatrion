import type { ReferenceKeyword } from '../../../type';

/** Bit-indexed immutable lists avoid allocating keyword arrays for each reference or chain result. */
const referenceKeywordLists: readonly (readonly ReferenceKeyword[])[] = [
  [],
  ['$ref'],
  ['$dynamicRef'],
  ['$ref', '$dynamicRef'],
  ['$recursiveRef'],
  ['$ref', '$recursiveRef'],
];

/**
 * Select only reference applicators recognized by this resource dialect.
 * @param schema Non-null object schema.
 * @param dialect Compiled dialect bit.
 * @returns A shared ordered read-only list, empty for ordinary schema nodes.
 */
export function getReferenceKeywords(
  schema: Record<string, unknown>,
  dialect: number,
): readonly ReferenceKeyword[] {
  return referenceKeywordLists[
    (typeof schema.$ref === 'string' ? 1 : 0) |
      (dialect === 16 && typeof schema.$dynamicRef === 'string' ? 2 : 0) |
      (dialect === 8 && typeof schema.$recursiveRef === 'string' ? 4 : 0)
  ];
}
