import type { FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';
import { slotShadowSessions } from './slotShadowSessions';

/** Validate the root identity carried by this verification-only cache entry. */
const ownsSlotShadowSession = <Self extends FieldNodeRecord<Self>>(
  value: object,
  root: Self,
): value is SlotShadowSession<Self> =>
  ('actual' in value && value.actual === root) ||
  ('shadow' in value && value.shadow === root);

/** Return a cached replay session only when either recorded root is this tree. */
export const getSlotShadowSession = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): SlotShadowSession<Self> | undefined => {
  const session = slotShadowSessions.get(root.runtime);
  return session && ownsSlotShadowSession(session, root) ? session : undefined;
};
