import {
  scheduleMacrotaskSafe,
  scheduleMicrotask,
} from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventType,
} from '@/schema-form/core/nodes/type';
import { SchemaFormError } from '@/schema-form/errors';
import { formatInfiniteLoopError } from '@/schema-form/helpers/error';

import { mergeEventEntries } from './utils/mergeEventEntries';

/**
 * Maximum number of event batches allowed before detecting an infinite loop.
 * This prevents browser tab freezing due to circular derived value dependencies.
 */
const MAX_LOOP_COUNT = 50;

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
  private __getInfo__: Fn<[], { path: string; dependencies: string[] }>;

  private __idle__ = true;
  private __count__ = 0;

  /**
   * Creates an EventCascade instance.
   * @param batchHandler - Function to handle collected events
   * @param getInfo - Function to get the node's JSON pointer path for error reporting
   */
  constructor(
    batchHandler: Fn<[eventCollection: NodeEventCollection]>,
    getInfo: Fn<[], { path: string; dependencies: string[] }>,
  ) {
    this.__batchHandler__ = batchHandler;
    this.__getInfo__ = getInfo;
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
   * @throws {SchemaFormError} When batch count exceeds MAX_EVENT_BATCH_COUNT (infinite loop detected)
   */
  private __acquireBatch__(): Batch<NodeEventEntity> {
    const batch = this.__currentBatch__;
    if (batch && !batch.resolved) return batch;

    // Check for infinite loop before creating new batch
    if (++this.__count__ > MAX_LOOP_COUNT) {
      const { path, dependencies } = this.__getInfo__();
      throw new SchemaFormError(
        'INFINITE_LOOP_DETECTED',
        formatInfiniteLoopError(
          path,
          dependencies,
          this.__count__,
          MAX_LOOP_COUNT,
        ),
        { path, dependencies, batchCount: this.__count__ },
      );
    }

    // Schedule batch count reset via macrotask (after all microtasks complete)
    if (this.__idle__) {
      this.__idle__ = false;
      scheduleMacrotaskSafe(() => {
        this.__idle__ = true;
        this.__count__ = 0;
      });
    }

    const nextBatch: Batch<NodeEventEntity> = { eventEntities: [] };
    this.__currentBatch__ = nextBatch;
    scheduleMicrotask(() => {
      nextBatch.resolved = true;
      this.__batchHandler__(mergeEventEntries(nextBatch.eventEntities));
    });
    return nextBatch;
  }
}
