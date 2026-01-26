import {
  scheduleMacrotaskSafe,
  scheduleMicrotask,
} from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventOptions,
  NodeEventPayload,
  NodeEventType,
  NodeListener,
} from '@/schema-form/core/nodes/type';
import { SchemaFormError } from '@/schema-form/errors';
import { formatInfiniteLoopError } from '@/schema-form/helpers/error';

import { getEventCollection } from './utils/getEventCollection';
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
 * Manages node event publishing, subscription, and batching.
 *
 * @description
 * EventCascadeManager encapsulates all event-related functionality for a node:
 * - Listener registration/unregistration
 * - Event batching to prevent recursive triggering and improve performance
 * - Dependency subscription management
 *
 * @example
 * ```typescript
 * const manager = new EventCascadeManager(() => ({
 *   path: node.path,
 *   dependencies: node.dependencyPaths,
 * }));
 *
 * // Subscribe to events
 * const unsubscribe = manager.subscribe((event) => {
 *   console.log('Event received:', event);
 * });
 *
 * // Publish an event
 * manager.publish(NodeEventType.UpdateValue, newValue);
 *
 * // Clean up
 * manager.cleanUp();
 * ```
 */
export class EventCascadeManager {
  private __currentBatch__: Batch<NodeEventEntity> | null = null;
  private __getInfo__: Fn<[], { path: string; dependencies: string[] }>;
  private __idle__ = true;
  private __count__ = 0;

  /**
   * Acquires the current event batch. If there is no batch, create a new one.
   * @returns Current event batch
   * @throws {SchemaFormError} When batch count exceeds MAX_LOOP_COUNT (infinite loop detected)
   */
  private __acquireBatch__(this: EventCascadeManager): Batch<NodeEventEntity> {
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
      this.__resolve__(mergeEventEntries(nextBatch.eventEntities));
    });
    return nextBatch;
  }

  /**
   * Publishes an event to the node's listeners.
   * @param type - Event type (see NodeEventType)
   * @param payload - Data for the event (see NodeEventPayload)
   * @param options - Options for the event (see NodeEventOptions)
   * @param immediate - If true, executes listeners synchronously; if false, batches event
   */
  public publish<EventType extends NodeEventType>(
    this: EventCascadeManager,
    type: EventType,
    payload?: NodeEventPayload[EventType],
    options?: NodeEventOptions[EventType],
  ): void {
    this.__acquireBatch__().eventEntities.push([type, payload, options]);
  }

  public dispatch<EventType extends NodeEventType>(
    this: EventCascadeManager,
    type: EventType,
    payload?: NodeEventPayload[EventType],
    options?: NodeEventOptions[EventType],
  ): void {
    this.__resolve__(getEventCollection(type, payload, options));
  }

  /**
   * Set of registered event listeners for this node.
   * @note Listeners receive batched events for performance optimization.
   */
  private __listeners__: Set<NodeListener> = new Set();

  /**
   * Dispatches an event collection to all listeners.
   * @param eventCollection - Merged event collection to dispatch
   */
  private __resolve__(
    this: EventCascadeManager,
    eventCollection: NodeEventCollection,
  ): void {
    for (const listener of this.__listeners__) listener(eventCollection);
  }

  /**
   * Registers a node event listener.
   * @param listener - Event listener callback
   * @returns Event listener removal function
   */
  public subscribe(this: EventCascadeManager, listener: NodeListener): Fn {
    this.__listeners__.add(listener);
    return () => {
      this.__listeners__.delete(listener);
    };
  }

  /**
   * Array of cleanup functions for subscriptions to other nodes.
   * @note Stores unsubscribe functions from dependency subscriptions.
   *       Called during cleanUp() to prevent memory leaks.
   */
  private __unsubscribes__: Array<Fn> = [];

  /**
   * Saves an event unsubscribe function for later cleanup.
   * @param unsubscribe - The unsubscribe function to save
   */
  public saveUnsubscribe(this: EventCascadeManager, unsubscribe: Fn): void {
    this.__unsubscribes__.push(unsubscribe);
  }

  /**
   * Clears all subscriptions and listeners.
   * @description Executes all saved unsubscribe functions and clears the listener set.
   */
  public cleanUp(this: EventCascadeManager): void {
    for (let i = 0, l = this.__unsubscribes__.length; i < l; i++)
      this.__unsubscribes__[i]();
    this.__unsubscribes__ = [];
    this.__listeners__.clear();
  }

  /**
   * Creates an EventCascadeManager instance.
   * @param getInfo - Function to get the node's JSON pointer path and dependencies for error reporting
   */
  constructor(getInfo: Fn<[], { path: string; dependencies: string[] }>) {
    this.__getInfo__ = getInfo;
  }
}
