import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeEventType, FieldNodeRequestType } from '../../../record';

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
    type: (previous?.type ?? 0) | bit,
    payload:
      payload === undefined
        ? previous?.payload
        : { ...previous?.payload, [bit]: payload },
  };
  queued.add(node);
  runtime.queuedNonSettleEvents = queued;
};
