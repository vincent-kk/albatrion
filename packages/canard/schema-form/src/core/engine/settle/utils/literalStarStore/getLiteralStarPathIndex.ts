import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { indexLiteralStarDescendant } from './indexLiteralStarDescendant';

/**
 * Build the call-local latent path index on first use from encoded keys.
 * @param context - Settlement owning the current latent store and lazy index
 * @returns Keys indexed under their own paths and every ancestor path
 */
export const getLiteralStarPathIndex = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): Map<string, Set<string>> => {
  let index = context.literalStarDescendantKeys;
  if (index) return index;
  index = new Map();
  for (const key of context.root.runtime.literalStarRaw?.keys() ?? []) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string')
      indexLiteralStarDescendant(index, key, identity[0], true);
  }
  context.literalStarDescendantKeys = index;
  return index;
};
