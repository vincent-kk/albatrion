import { scheduleMicrotask } from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventType,
} from '@/schema-form/core/nodes/type';

import { mergeEventEntries } from './utils/mergeEventEntries';

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
      this.__batchHandler__(mergeEventEntries(nextBatch.eventEntities));
    });
    return nextBatch;
  }
}
