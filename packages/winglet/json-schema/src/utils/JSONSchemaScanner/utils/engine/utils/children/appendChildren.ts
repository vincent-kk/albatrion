import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { KeywordDescriptor, SchemaEntry } from '../../../../type';
import type { KeywordMap } from '../../../keywordDescriptors';
import { appendKeywordChildren } from './utils/appendKeywordChildren';

/**
 * Append captured children in vocabulary order without allocating intermediate frame arrays.
 * @param entries Engine-owned stack receiving fresh child entries in forward visit order.
 * @param parent Entry after filter, mutation, entry and reference processing.
 * @param keywords Vocabulary lookup carrying descriptor positions.
 * @param ordered Descriptors indexed by position; later overrides can leave holes.
 * @param masks Reusable engine-owned words for positions beyond the first 32; consumed and cleared here.
 * @returns Nothing; the caller reverses only the appended span for DFS.
 */
export function appendChildren<Schema extends SchemaEntry>(
  entries: Schema[],
  parent: Schema,
  keywords: KeywordMap,
  ordered: readonly KeywordDescriptor[],
  masks: number[],
): void {
  const { schema, path, dataPath, depth } = parent;
  if (schema === null || typeof schema !== 'object') return;
  const childDepth = depth + 1;
  let mask = 0;
  for (const key in schema) {
    const descriptor = keywords.get(key);
    if (descriptor === undefined || !hasOwnProperty(schema, key)) continue;
    if (descriptor.order < 32) mask |= 1 << descriptor.order;
    else masks[(descriptor.order >>> 5) - 1] |= 1 << (descriptor.order & 31);
  }
  while (mask !== 0) {
    const bit = mask & -mask;
    mask ^= bit;
    appendKeywordChildren(
      entries,
      schema,
      ordered[31 - Math.clz32(bit)],
      path,
      dataPath,
      childDepth,
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
        ordered[(word + 1) * 32 + 31 - Math.clz32(bit)],
        path,
        dataPath,
        childDepth,
      );
    }
  }
}
