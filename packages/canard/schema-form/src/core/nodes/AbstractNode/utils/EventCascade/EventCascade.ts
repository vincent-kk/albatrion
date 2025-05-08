import { BITMASK_NONE, scheduleMicrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { NodeEvent, NodeEventType } from '../../../type';

type Batch<Value> = {
  resolved?: boolean;
  events: Array<Value>;
};

export class EventCascade {
  #currentBatch: Batch<NodeEvent> | null = null;
  get #batch(): Batch<NodeEvent> {
    const batch = this.#currentBatch;
    if (batch && !batch.resolved) return batch;
    const nextBatch: Batch<NodeEvent> = { events: [] };
    this.#currentBatch = nextBatch;
    scheduleMicrotask(() => {
      nextBatch.resolved = true;
      this.#batchHandler(mergeEvents(nextBatch.events));
    });
    return nextBatch;
  }
  #batchHandler: Fn<[event: NodeEvent]>;
  constructor(batchHandler: Fn<[event: NodeEvent]>) {
    this.#batchHandler = batchHandler;
  }
  push(event: NodeEvent): void {
    const batch = this.#batch;
    batch.events.push(event);
  }
}

const mergeEvents = (events: ReadonlyArray<NodeEvent>) => {
  const merged: Required<NodeEvent> = {
    type: BITMASK_NONE as NodeEventType,
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
