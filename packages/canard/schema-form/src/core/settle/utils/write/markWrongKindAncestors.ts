import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { isPlain } from './isPlain';

/**
 * Record object ancestors whose wrong-kind source may need conditional clearing.
 * @param node - Non-load caller target below one or more object hosts
 * @param context - Settlement that owns the pending caller effect
 * @returns Nothing; candidates remain unchanged until child emits are calculated
 */
export const markWrongKindAncestors = <Self extends SchemaNodeRecord<Self>>(
  node: Self, context: SettlementContext<Self>,
): void => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === 'object' && parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined && !isPlain(parent.raw))
      context.wrongKindHosts.add(parent);
    parent = parent.parent;
  }
};
