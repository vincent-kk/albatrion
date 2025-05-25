import { scheduleMicrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/app/constants/bitmask';

import type { NodeEvent, NodeEventType } from '../../../type';

/**
 * Event batch data structure
 * @template Value - Type of value stored in the batch
 */
type Batch<Value> = {
  resolved?: boolean;
  events: Array<Value>;
};

/**
 * Collects multiple events and publishes them as a single merged event
 * to prevent recursive event triggering and improve performance.
 */
export class EventCascade {
  private __currentBatch__: Batch<NodeEvent> | null = null;
  /**
   * Gets the current event batch. If there is no batch, create a new one.
   * @returns Current event batch
   */
  private get __batch__(): Batch<NodeEvent> {
    const batch = this.__currentBatch__;
    if (batch && !batch.resolved) return batch;
    const nextBatch: Batch<NodeEvent> = { events: [] };
    this.__currentBatch__ = nextBatch;
    scheduleMicrotask(() => {
      nextBatch.resolved = true;
      this.__batchHandler__(mergeEvents(nextBatch.events));
    });
    return nextBatch;
  }
  private __batchHandler__: Fn<[event: NodeEvent]>;
  /**
   * Creates an EventCascade instance.
   * @param batchHandler - Function to handle collected events
   */
  constructor(batchHandler: Fn<[event: NodeEvent]>) {
    this.__batchHandler__ = batchHandler;
  }
  /**
   * Adds an event to the batch.
   * @param event - Event to add
   */
  public push(event: NodeEvent): void {
    const batch = this.__batch__;
    batch.events.push(event);
  }
}

/**
 * Merges an array of events into a single event.
 * @param events - Array of events to merge
 * @returns Merged event
 */
const mergeEvents = (events: ReadonlyArray<NodeEvent>) => {
  const merged: Required<NodeEvent> = {
    type: BIT_MASK_NONE as NodeEventType,
    payload: {},
    options: {},
  };
  for (const { type, payload, options } of events) {
    merged.type |= type;
    if (payload?.[type] !== undefined)
      (merged.payload[type] as (typeof payload)[typeof type]) = payload[type];
    if (options?.[type] !== undefined)
      (merged.options[type] as (typeof options)[typeof type]) = options[type];
  }
  return merged;
};
