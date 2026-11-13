import { escapeSegment } from '@winglet/json/pointer';

import type { KeywordDescriptor } from '../../type';
import { DIALECT_FLAGS } from '../dialect/dialectFlags';
import type { KeywordMap } from './type';

/**
 * Compile descriptor ordering, dialect membership and escaped path tokens before traversal.
 * @param descriptors Vocabulary in visit order; the last duplicate completely overrides earlier entries.
 * @returns A fresh lookup whose holes retain the winning descriptor's original position.
 */
export function buildKeywordMap(
  descriptors: readonly KeywordDescriptor[],
): KeywordMap {
  const map: KeywordMap = new Map();
  for (let order = 0; order < descriptors.length; order++) {
    const descriptor = descriptors[order];
    let mask = 31;
    if (descriptor.dialects !== undefined) {
      mask = 0;
      for (const dialect of descriptor.dialects) mask |= DIALECT_FLAGS[dialect];
    }
    map.set(descriptor.keyword, {
      ...descriptor,
      order,
      path: escapeSegment(descriptor.keyword),
      mask,
    });
  }
  return map;
}
