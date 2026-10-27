import type { FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';
import { captureSlotShadowObservations } from './captureSlotShadowObservations';
import { compareSlotShadowObservations } from './compareSlotShadowObservations';
import { rejectSlotShadowDifference } from './rejectSlotShadowDifference';
import { slotShadowSessions } from './slotShadowSessions';

/**
 * Reject a divergent committed result and count only completed comparisons.
 * @param root - Root at the end of commitSettlement, before delivery drains
 * @returns Nothing; off and ordinary on trees allocate no verification state
 */
export const compareSlotShadowCommit = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  if (root.runtime.slots !== 'verify' && root.runtime.slots !== 'off') return;
  const session = slotShadowSessions.get(root.runtime) as
    | SlotShadowSession<Self>
    | undefined;
  if (root.runtime.slots === 'off') {
    if (session)
      session.expectedCommits.push(captureSlotShadowObservations(session));
    return;
  }
  if (!session)
    throw new Error('Slot shadow commit has no independent replay session');
  if (!session.active)
    rejectSlotShadowDifference(session, 'commit.withoutReplay');
  const expected = session.expectedCommits.shift();
  if (!expected)
    return rejectSlotShadowDifference(session, 'commit.missingBaseline');
  if (root.runtime.commitNumber !== expected.commit)
    rejectSlotShadowDifference(session, 'commitNumber');
  compareSlotShadowObservations(session, expected);
  const commit = root.runtime.commitNumber ?? 0;
  if (session.comparedCommit !== commit) {
    session.comparedCommit = commit;
    const accounting = (root.runtime.slotVerification ??= {
      commits: 0,
      differences: 0,
    });
    accounting.commits += 1;
  }
};
