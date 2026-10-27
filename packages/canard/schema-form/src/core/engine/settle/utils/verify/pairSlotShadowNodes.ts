import type { FieldNodeRecord } from '../../../record';
import type {
  SlotShadowSession,
  SlotShadowSnapshot,
} from '../../types/slotVerification';
import { rejectSlotShadowDifference } from './rejectSlotShadowDifference';

/**
 * Pair live occurrences in document order without replacing historical pairs.
 * @param session - Session retaining all earlier detached references
 * @param actual - Live retained-slot occurrence
 * @param shadow - Corresponding independently selected latent occurrence
 * @returns Nothing; conflicting occurrence lifetimes reject the comparison
 */
export const pairSlotShadowNodes = <Self extends FieldNodeRecord<Self>>(
  session: SlotShadowSession<Self>,
  actual: Self,
  shadow: Self,
  snapshot?: SlotShadowSnapshot<Self>,
): void => {
  if (
    actual.path !== shadow.path ||
    actual.blueprintNode !== shadow.blueprintNode ||
    (session.nodes.has(actual) && session.nodes.get(actual) !== shadow) ||
    (session.reverseNodes.has(shadow) &&
      session.reverseNodes.get(shadow) !== actual)
  )
    rejectSlotShadowDifference(session, actual.path + '.occurrence');
  session.nodes.set(actual, shadow);
  session.reverseNodes.set(shadow, actual);
  const children = actual.children ?? [];
  const observation = snapshot?.nodes.get(shadow);
  const baseline = (observation ? observation.children : shadow.children) ?? [];
  if (children.length !== baseline.length)
    rejectSlotShadowDifference(session, actual.path + '.children.length');
  for (let index = 0; index < children.length; index++)
    pairSlotShadowNodes(session, children[index], baseline[index], snapshot);
};
