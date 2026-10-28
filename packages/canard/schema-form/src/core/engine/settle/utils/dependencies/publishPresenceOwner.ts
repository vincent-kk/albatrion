import { resolvePointer } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getLivePresenceNode } from './getLivePresenceNode';

/**
 * Preserve final publication for an owner whose gate needs no recalculation.
 * @param owner - Bound owner pointer, possibly absent in the current shape
 * @param context - Publication candidates and parent shape marks to update
 * @returns Nothing; live owners join final state publication without dirty paths
 */
export const publishPresenceOwner = <Self extends FieldNodeRecord<Self>>(
  owner: string,
  context: SettlementContext<Self>,
): void => {
  context.dependencyOwnerPaths.add(owner);
  context.shapeDirtyPaths.add(resolvePointer(owner, '..'));
  const live = getLivePresenceNode(context.root, owner);
  if (live) context.stateDirtyNodes.add(live);
};
