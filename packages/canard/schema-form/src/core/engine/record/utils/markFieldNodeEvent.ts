import type { FieldNodeEventType } from '../constants/FieldNodeEventType';
import type { FieldNodeRecord } from '../types/record';

/**
 * Merge one event into the record's pending delivery without scheduling it.
 * @param node - Occurrence receiving the event in this tree
 * @param bit - Single event bit to combine with pending bits
 * @param payload - Event-specific value, replacing an older value for this bit
 * @param options - Event-specific metadata, replacing older metadata for this bit
 * @returns Nothing; dispatch later consumes the record event
 */
export const markFieldNodeEvent = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  bit: FieldNodeEventType,
  payload?: unknown,
  options?: unknown,
): void => {
  const deliveries = (node.runtime.deliveries ??= new Set());
  const previous = node.pendingDelivery;
  if (previous) {
    previous.type |= bit;
    if (payload !== undefined) (previous.payload ??= {})[bit] = payload;
    if (options !== undefined) (previous.options ??= {})[bit] = options;
  } else
    node.pendingDelivery = {
      type: bit,
      payload: payload === undefined ? undefined : { [bit]: payload },
      options: options === undefined ? undefined : { [bit]: options },
    };
  deliveries.add(node);
  node.pendingRevision |= bit;
  (node.runtime.revisionNodes ??= new Set()).add(node);
};
