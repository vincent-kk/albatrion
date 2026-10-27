import type { FieldNodeRecord } from '../../../record';
import { compareSlotShadowObservations } from './compareSlotShadowObservations';
import { compareSlotShadowValue } from './compareSlotShadowValue';
import { createSlotShadowSession } from './createSlotShadowSession';
import { getSlotShadowSession } from './getSlotShadowSession';
import { rejectSlotShadowDifference } from './rejectSlotShadowDifference';
import { slotShadowSessions } from './slotShadowSessions';
import { synchronizeSlotShadowInputs } from './synchronizeSlotShadowInputs';

/**
 * Replay one low-level operation on a separate off tree before actual execution.
 * @param node - Live or historically retained target before the operation
 * @param replay - Same operation with resolved caller inputs and a paired target
 * @returns Cleanup for the outer operation; nested and ordinary paths return none
 */
export const prepareSlotShadow = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  replay: (shadow: Self) => unknown,
): ((error?: unknown) => void) | undefined => {
  const root = node.rootNode;
  if (root.runtime.slots !== 'verify') return undefined;
  let session = getSlotShadowSession(root);
  if (!session) {
    if (root.runtime.commitNumber)
      throw new Error('Slot shadow must begin before the first commit');
    session = createSlotShadowSession(root);
    slotShadowSessions.set(root.runtime, session);
    slotShadowSessions.set(session.shadow.runtime, session);
  }
  if (session.active) return undefined;
  session.active = true;
  session.failure = undefined;
  session.replayError = undefined;
  synchronizeSlotShadowInputs(session);
  const target = session.nodes.get(node);
  if (!target)
    return rejectSlotShadowDifference(session, node.path + '.unpairedTarget');
  try {
    replay(target);
  } catch (error) {
    session.replayError = error;
  }
  const current = session;
  return (error?: unknown) => {
    try {
      if (current.failure) throw current.failure;
      compareSlotShadowValue(
        current,
        error,
        current.replayError,
        'operation.error',
        undefined,
        false,
      );
      compareSlotShadowObservations(current);
      if (root.runtime.commitNumber !== current.shadow.runtime.commitNumber)
        rejectSlotShadowDifference(current, 'commitNumber.afterOperation');
      if (current.expectedCommits.length)
        rejectSlotShadowDifference(current, 'commit.uncheckedBaseline');
    } finally {
      current.active = false;
    }
  };
};
