import { escapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Collect the whole-replacement scopes of a multi-write batch (191C-01, 26C-10).
 * A caller write contributes its own path; a shallow Merge contributes the child path of
 * each received key; an automatic write contributes nothing, as it never replaces outside
 * a batch either.
 * @param writeOrigins - Call-ordered batch origins as flushBatchWrites recorded them
 * @returns Paths whose subtrees the batch replaces, in origin order, possibly repeated
 */
export const collectReplacePaths = <Self extends SchemaNodeRecord<Self>>(
  writeOrigins: NonNullable<SettlementContext<Self>['writeOrigins']>,
): string[] => {
  const paths: string[] = [];
  for (let index = 0; index < writeOrigins.length; index++) {
    const origin = writeOrigins[index];
    if (origin.source === 'automatic') continue;
    if (origin.keys)
      for (let key = 0; key < origin.keys.length; key++)
        paths.push(`${origin.path}/${escapeSegment(origin.keys[key])}`);
    else paths.push(origin.path);
  }
  return paths;
};
