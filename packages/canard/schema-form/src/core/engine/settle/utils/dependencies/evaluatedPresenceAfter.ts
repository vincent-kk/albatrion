import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getLivePresenceNode } from './getLivePresenceNode';

/**
 * Check whether an owner's gate host already evaluated the changed presence.
 * @param owner - Absolute bound owner pointer; the root has no parent gate host
 * @param stamp - Latest contributing change's call-local logical time
 * @param context - Live shape and gate evaluation starts for this settlement
 * @returns Whether the live parent began evaluation strictly after the change
 */
export const evaluatedPresenceAfter = <Self extends FieldNodeRecord<Self>>(
  owner: string,
  stamp: number,
  context: SettlementContext<Self>,
): boolean => {
  if (!owner) return false;
  const host = getLivePresenceNode(
    context.root,
    resolvePointer(owner, $.Parent),
  );
  return (
    host !== undefined && (context.presenceRoundStarts?.get(host) ?? 0) > stamp
  );
};
