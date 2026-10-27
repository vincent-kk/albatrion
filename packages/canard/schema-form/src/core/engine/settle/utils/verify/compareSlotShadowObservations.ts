import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeDelivery, FieldNodeRecord } from '../../../record';
import type {
  SlotShadowSession,
  SlotShadowSnapshot,
} from '../../types/slotVerification';
import { captureSlotShadowObservations } from './captureSlotShadowObservations';
import { compareSlotShadowDelivery } from './compareSlotShadowDelivery';
import { compareSlotShadowValue } from './compareSlotShadowValue';
import { pairSlotShadowNodes } from './pairSlotShadowNodes';
import { rejectSlotShadowDifference } from './rejectSlotShadowDifference';
import {
  SLOT_SHADOW_PUBLIC_CHANNELS,
  SLOT_SHADOW_RECORD_CHANNELS,
  SLOT_SHADOW_RUNTIME_CHANNELS,
} from './slotShadowChannels';

/**
 * Check live and retained public reads against the independent latent oracle.
 * @param session - Session containing all occurrence lifetimes seen at commits
 * @param expected - Exact baseline commit point, or current final observations
 * @returns Nothing; value, event or reference disagreements reject comparison
 */
export const compareSlotShadowObservations = <
  Self extends FieldNodeRecord<Self>,
>(
  session: SlotShadowSession<Self>,
  expected: SlotShadowSnapshot<Self> = captureSlotShadowObservations(session),
): void => {
  pairSlotShadowNodes(session, session.actual, session.shadow, expected);
  for (const key of SLOT_SHADOW_RUNTIME_CHANNELS)
    compareSlotShadowValue(
      session,
      session.actual.runtime[key],
      expected.runtime[key],
      'runtime.' + key,
      undefined,
      false,
    );
  for (const [node, shadow] of session.nodes) {
    const observation = expected.nodes.get(shadow);
    if (!observation)
      return rejectSlotShadowDifference(
        session,
        node.path + '.missingObservation',
      );
    for (const key of SLOT_SHADOW_PUBLIC_CHANNELS) {
      if (!(key in node) && !(key in observation.values)) continue;
      compareSlotShadowValue(
        session,
        Reflect.get(node, key),
        observation.values[key],
        node.path + '.' + key,
      );
    }
    for (const key of SLOT_SHADOW_RECORD_CHANNELS)
      compareSlotShadowValue(
        session,
        node[key],
        observation.values[key],
        node.path + '.' + key,
        undefined,
        false,
      );
    for (const key of ['pendingDelivery', 'pendingNonSettleDelivery'] as const)
      compareSlotShadowDelivery(
        session,
        node[key],
        observation.values[key] as FieldNodeDelivery | undefined,
        node.path + '.' + key,
      );
    for (let bit = 1, index = 0; bit <= 65536; bit *= 2, index++)
      if (node.revisionLedger[bit] !== observation.revisions[index])
        rejectSlotShadowDifference(
          session,
          node.path +
            '.revision.' +
            bit +
            ' (' +
            node.revisionLedger[bit] +
            ' !== ' +
            observation.revisions[index] +
            ', detached=' +
            node.detached +
            ')',
        );
    const inactive = Reflect.get(node, 'inactiveValues');
    if (
      Object.isFrozen(inactive) !==
      Object.isFrozen(observation.values.inactiveValues)
    )
      rejectSlotShadowDifference(session, node.path + '.inactiveValues.frozen');
    const latent = observation.values.inactiveValues;
    if (isArray(inactive) && isArray(latent))
      for (let index = 0; index < inactive.length; index++)
        if (Object.isFrozen(inactive[index]) !== Object.isFrozen(latent[index]))
          rejectSlotShadowDifference(
            session,
            node.path + '.inactiveValues.' + index + '.frozen',
          );
  }
};
