import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import type { FieldNodeEventType } from '../constants/FieldNodeEventType';
import type { FieldNodeRequestType } from '../constants/FieldNodeRequestType';
import type { FieldNodeRecord } from '../types/record';

/**
 * Merge an event into the next wave without touching settlement's event table.
 * @param node - Live occurrence receiving the event
 * @param bit - One event bit to merge for this occurrence
 * @param payload - Latest value for this event bit, when present
 * @returns Nothing; the outer entry or caller flushes this table
 */
export const queueNonSettleEvent = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  bit: FieldNodeEventType | FieldNodeRequestType,
  payload?: unknown,
): void => {
  const runtime = node.rootNode.runtime;
  const queued = runtime.queuedNonSettleEvents ?? new Set();
  const previous = node.pendingNonSettleDelivery;
  node.pendingNonSettleDelivery = {
    type: (previous?.type ?? BIT_MASK_NONE) | bit,
    payload:
      payload === undefined
        ? previous?.payload
        : { ...previous?.payload, [bit]: payload },
  };
  queued.add(node);
  runtime.queuedNonSettleEvents = queued;
};
