import type { FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';

/**
 * Record and reject the first mismatched public observation in an operation.
 * @param session - Active verify session whose counters belong to the on tree
 * @param path - Observable channel that disagreed with the latent baseline
 * @returns Never; subsequent cleanup preserves this same failure
 */
export const rejectSlotShadowDifference = <Self extends FieldNodeRecord<Self>>(
  session: SlotShadowSession<Self>,
  path: string,
): never => {
  if (!session.failure) {
    const accounting = (session.actual.runtime.slotVerification ??= {
      commits: 0,
      differences: 0,
    });
    accounting.differences += 1;
    session.failure = new Error('Slot shadow difference at ' + path);
  }
  throw session.failure;
};
