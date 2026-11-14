import { DialectFlag } from '../../../../dialect/DialectFlag';
import type { ReferenceKeyword } from '../../../type';

/** Index bits of referenceKeywordLists: one per reference applicator present on a node. */
const enum ReferenceBit {
  Ref = 1 << 0,
  DynamicRef = 1 << 1,
  RecursiveRef = 1 << 2,
}

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
    (typeof schema.$ref === 'string' ? ReferenceBit.Ref : 0) |
      (dialect === DialectFlag.Draft202012 &&
      typeof schema.$dynamicRef === 'string'
        ? ReferenceBit.DynamicRef
        : 0) |
      (dialect === DialectFlag.Draft201909 &&
      typeof schema.$recursiveRef === 'string'
        ? ReferenceBit.RecursiveRef
        : 0)
  ];
}
