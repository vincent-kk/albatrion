import { scheduleMicrotask } from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/app/constants/bitmask';
import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventType,
} from '@/schema-form/core/nodes/type';

/**
 * Event batch data structure
 * @template Value - Type of value stored in the batch
 */
type Batch<Value> = {
  resolved?: boolean;
  eventEntities: Array<Value>;
};

/**
 * Collects multiple events and publishes them as a single merged event
 * to prevent recursive event triggering and improve performance.
 */
export class EventCascade {
  private __currentBatch__: Batch<NodeEventEntity> | null = null;
  private __batchHandler__: Fn<[eventCollection: NodeEventCollection]>;

  /**
   * Creates an EventCascade instance.
   * @param batchHandler - Function to handle collected events
   */
  constructor(batchHandler: Fn<[eventCollection: NodeEventCollection]>) {
    this.__batchHandler__ = batchHandler;
  }

  /**
   * Adds an event to the batch.
   * @param eventEntity - Event to add
   */
  public schedule<Type extends NodeEventType>(
    eventEntity: NodeEventEntity<Type>,
  ): void {
    const batch = this.__acquireBatch__();
    batch.eventEntities.push(eventEntity);
  }

  /**
   * Acquires the current event batch. If there is no batch, create a new one.
   * @returns Current event batch
   */
  private __acquireBatch__(): Batch<NodeEventEntity> {
    const batch = this.__currentBatch__;
    if (batch && !batch.resolved) return batch;
    const nextBatch: Batch<NodeEventEntity> = { eventEntities: [] };
    this.__currentBatch__ = nextBatch;
    scheduleMicrotask(() => {
      nextBatch.resolved = true;
      this.__batchHandler__(mergeEvents(nextBatch.eventEntities));
    });
    return nextBatch;
  }
}

/**
 * Merges an array of events into a single event.
 * @param eventEntities - Array of events to merge
 * @returns Merged event
 */
const mergeEvents = (eventEntities: ReadonlyArray<NodeEventEntity>) => {
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
