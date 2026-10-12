import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { indexLatentDescendant } from './indexLatentDescendant';

/**
 * Build the call-local latent path index on first use from encoded keys.
 * @param context - Settlement owning the current latent store and lazy index
 * @returns Keys indexed under their own paths and every ancestor path
 */
export const getLatentPathIndex = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): Map<string, Set<string>> => {
  let index = context.latentDescendantKeys;
  if (index) return index;
  index = new Map();
  for (const key of context.root.runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string')
      indexLatentDescendant(index, key, identity[0], true);
  }
  context.latentDescendantKeys = index;
  return index;
};
