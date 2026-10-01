import type { SchemaNodeRecord } from '../type';
import type { SchemaNodeEventType } from '../SchemaNodeEventType';

/**
 * Merge one event into the tree's pending delivery table without scheduling it.
 * @param node - Occurrence receiving the event in this tree
 * @param bit - Single event bit to combine with pending bits
 * @param payload - Event-specific value, replacing an older value for this bit
 * @param options - Event-specific metadata, replacing older metadata for this bit
 * @returns Nothing; dispatch later consumes the runtime table
 */
export const markSchemaNodeEvent = <Self extends SchemaNodeRecord<Self>>(
  node: Self, bit: SchemaNodeEventType, payload?: unknown, options?: unknown,
): void => {
  const deliveries = node.runtime.deliveries ?? new Map();
  const previous = deliveries.get(node);
  deliveries.set(node, {
    type: (previous?.type ?? 0) | bit,
    payload: payload === undefined ? previous?.payload :
      { ...previous?.payload, [bit]: payload },
    options: options === undefined ? previous?.options :
      { ...previous?.options, [bit]: options },
  });
  node.runtime.deliveries = deliveries;
  const queued = node.runtime.queuedEvents ?? new Map();
  queued.set(node, { type: (queued.get(node)?.type ?? 0) | bit });
  node.runtime.queuedEvents = queued;
};
