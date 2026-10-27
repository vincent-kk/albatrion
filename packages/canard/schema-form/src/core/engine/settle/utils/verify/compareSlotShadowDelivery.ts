import type { FieldNodeDelivery, FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';
import { compareSlotShadowValue } from './compareSlotShadowValue';

/**
 * Check event structure and payload aliases to current or retained public data.
 * @param session - Persistent public identity relations for this verify tree
 * @param actual - Retained-path event before dispatcher delivery
 * @param shadow - Independent baseline event at the same commit point
 * @param path - Channel address used to identify a mismatched payload
 * @returns Nothing; event-envelope allocation is not treated as a public alias
 */
export const compareSlotShadowDelivery = <Self extends FieldNodeRecord<Self>>(
  session: SlotShadowSession<Self>,
  actual: FieldNodeDelivery | undefined,
  shadow: FieldNodeDelivery | undefined,
  path: string,
): void => {
  compareSlotShadowValue(session, actual, shadow, path, undefined, false);
  for (const channel of ['payload', 'options'] as const) {
    const values = actual?.[channel];
    const baseline = shadow?.[channel];
    if (!values || !baseline) continue;
    for (const key of Object.keys(values))
      compareSlotShadowValue(
        session,
        Reflect.get(values, key),
        Reflect.get(baseline, key),
        path + '.' + channel + '.' + key,
      );
  }
};
