import { BITMASK_NONE, microtask } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { NodeEvent, NodeEventType } from '../../../type';

type Batch<Value> = {
  isResolved: boolean;
  events: Array<Value>;
};

export class EventQueue {
  #currentBatch: Batch<NodeEvent> | null = null;
  get #batch(): Batch<NodeEvent> {
    const batch = this.#currentBatch;
    if (batch && !batch.isResolved) return batch;
    const nextBatch = { isResolved: false, events: [] };
    this.#currentBatch = nextBatch;
    microtask(() => {
      this.#batchHandler(dispatch(nextBatch));
    });
    return nextBatch;
  }
  #batchHandler: Fn<[NodeEvent]>;
  constructor(batchHandler: Fn<[NodeEvent]>) {
    this.#batchHandler = batchHandler;
  }
  push(event: NodeEvent): void {
    const batch = this.#batch;
    batch.events.push(event);
  }
}

const dispatch = (batch: Batch<NodeEvent>) => {
  batch.isResolved = true;
  const merged: Required<NodeEvent> = {
    type: BITMASK_NONE as NodeEventType,
    payload: {},
    options: {},
  };
  for (const { type, payload, options } of batch.events) {
    merged.type |= type;
    if (payload?.[type]) merged.payload[type] = payload[type] as any;
    if (options?.[type]) merged.options[type] = options[type] as any;
  }
  return merged;
};
