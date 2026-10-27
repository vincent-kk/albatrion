import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type {
  SlotShadowSession,
  SlotShadowSnapshot,
} from '../../types/slotVerification';
import {
  SLOT_SHADOW_PUBLIC_CHANNELS,
  SLOT_SHADOW_RECORD_CHANNELS,
  SLOT_SHADOW_RUNTIME_CHANNELS,
} from './slotShadowChannels';

/**
 * Capture baseline reads before an entry's finally blocks publish later inputs.
 * @param session - Independent baseline and its historical occurrence pairings
 * @returns Commit-time reads retaining the actual public object identities
 */
export const captureSlotShadowObservations = <
  Self extends FieldNodeRecord<Self>,
>(
  session: SlotShadowSession<Self>,
): SlotShadowSnapshot<Self> => {
  const root = session.shadow;
  const nodes = new Set(session.nodes.values());
  nodes.add(root);
  for (const node of nodes)
    for (const child of node.children ?? []) nodes.add(child);
  const snapshot: SlotShadowSnapshot<Self> = {
    commit: root.runtime.commitNumber ?? 0,
    runtime: {},
    nodes: new Map(),
  };
  for (const key of SLOT_SHADOW_RUNTIME_CHANNELS) {
    const value = root.runtime[key];
    snapshot.runtime[key] = isArray(value) ? [...value] : value;
  }
  for (const node of nodes) {
    const values: Record<string, unknown> = {};
    for (const key of SLOT_SHADOW_PUBLIC_CHANNELS)
      if (key in node) values[key] = Reflect.get(node, key);
    for (const key of SLOT_SHADOW_RECORD_CHANNELS) values[key] = node[key];
    const revisions: (number | undefined)[] = [];
    for (let bit = 1; bit <= 65536; bit *= 2)
      revisions.push(node.revisionLedger[bit]);
    snapshot.nodes.set(node, {
      values,
      children: node.children,
      pendingDelivery: node.pendingDelivery,
      pendingNonSettleDelivery: node.pendingNonSettleDelivery,
      revisions,
    });
  }
  return snapshot;
};
