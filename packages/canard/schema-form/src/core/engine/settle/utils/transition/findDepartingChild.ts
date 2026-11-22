import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Find the child that left a host's live children in this settlement and still awaits its exit.
 * Derive runs after compute decided exits, so a declarative write that names such a child writes
 * this record, and the exit then retains the written value as the same write after the exit does.
 * @param host - Live host whose child selection ran in this settlement
 * @param name - Declared child name
 * @param context - Settlement holding the pending exits
 * @returns The departing occurrence, or undefined when none is pending under that name
 */
export const findDepartingChild = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  name: string,
  context: SettlementContext<Self>,
): Optional<Self> => {
  if (context.pendingExits.size === 0) return undefined;
  for (const departing of context.pendingExits.values())
    if (
      departing.parent === host &&
      departing.name === name &&
      !departing.isDetached &&
      host.childrenByName?.[name] !== departing
    )
      return departing;
  return undefined;
};
