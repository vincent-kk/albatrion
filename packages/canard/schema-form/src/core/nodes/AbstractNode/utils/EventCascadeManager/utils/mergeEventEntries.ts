import { BIT_MASK_NONE } from '@/schema-form/app/constants';
import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventType,
} from '@/schema-form/core/nodes/type';

/**
 * Merges an array of events into a single event.
 * @param eventEntities - Array of events to merge
 * @returns Merged event
 */
export const mergeEventEntries = (
  eventEntities: ReadonlyArray<NodeEventEntity>,
): NodeEventCollection => {
  const merged: Required<NodeEventCollection> = {
    type: BIT_MASK_NONE as NodeEventType,
    payload: {},
    options: {},
  };
  for (let i = 0, l = eventEntities.length; i < l; i++) {
    const eventEntity = eventEntities[i];
    merged.type |= eventEntity[0];
    if (eventEntity[1] !== undefined)
      (merged.payload[eventEntity[0]] as NodeEventEntity[1]) = eventEntity[1];
    if (eventEntity[2] !== undefined)
      (merged.options[eventEntity[0]] as NodeEventEntity[2]) = eventEntity[2];
  }
  return merged;
};
