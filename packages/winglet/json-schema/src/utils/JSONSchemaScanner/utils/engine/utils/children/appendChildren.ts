import { hasOwnProperty } from '@winglet/common-utils/lib';

import type {
  KeywordMap,
  OrderedKeywordDescriptor,
} from '../../../keywordMap/type';
import type { SchemaEntry } from '../../../type';
import { LegacyMode } from '../LegacyMode';
import { appendKeywordChildren } from './utils/appendKeywordChildren';

/** Layout of the 32-bit words that record which keywords a node carries, indexed by descriptor order. */
const enum MaskWord {
  /** Keyword orders one word holds. */
  Bits = 32,
  /** Shift that turns a descriptor order into its word index. */
  IndexShift = 5,
  /** Highest bit position in a word; also the mask of an order's position inside its word. */
  LastBit = Bits - 1,
}

/**
 * Append captured children in vocabulary order without allocating intermediate frame arrays.
 * @param entries Engine-owned stack receiving fresh child entries in forward visit order.
 * @param parent Entry after filter, mutation, entry and reference processing.
 * @param keywords Vocabulary lookup carrying descriptor positions.
 * @param ordered Descriptors indexed by position; later overrides can leave holes.
 * @param masks Reusable engine-owned words for positions beyond the first 32; consumed and cleared here.
 * @param dialect Enclosing resource dialect bit, already resolved before child capture.
 * @param visitBooleans Whether callbacks can observe boolean leaves.
 * @returns Nothing; the caller reverses only the appended span for DFS.
 */
export function appendChildren<Schema extends SchemaEntry>(
  entries: Schema[],
  parent: Schema,
  keywords: KeywordMap,
  ordered: readonly OrderedKeywordDescriptor[],
  masks: number[],
  dialect: number,
  visitBooleans: boolean,
  legacyMode: LegacyMode = LegacyMode.None,
): void {
  const { schema, path, dataPath, depth } = parent;
  if (schema === null || typeof schema !== 'object' || Array.isArray(schema))
    return;
  const childDepth = depth + 1;
  const inert = !!parent.inert;
  let mask = 0;
  for (const key in schema) {
    const descriptor = keywords.get(key);
    if (descriptor === undefined || !hasOwnProperty(schema, key)) continue;
    if (descriptor.order < MaskWord.Bits) mask |= 1 << descriptor.order;
    else
      masks[(descriptor.order >>> MaskWord.IndexShift) - 1] |=
        1 << (descriptor.order & MaskWord.LastBit);
  }
  while (mask !== 0) {
    const bit = mask & -mask;
    mask ^= bit;
    appendKeywordChildren(
      entries,
      schema,
      ordered[MaskWord.LastBit - Math.clz32(bit)],
      path,
      dataPath,
      childDepth,
      dialect,
      inert,
      visitBooleans,
      legacyMode,
    );
  }
  for (let word = 0; word < masks.length; word++) {
    mask = masks[word];
    masks[word] = 0;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      appendKeywordChildren(
        entries,
        schema,
        ordered[
          (word + 1) * MaskWord.Bits + MaskWord.LastBit - Math.clz32(bit)
        ],
        path,
        dataPath,
        childDepth,
        dialect,
        inert,
        visitBooleans,
        legacyMode,
      );
    }
  }
}
