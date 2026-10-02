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
  const deliveries = node.runtime.deliveries ??= new Map();
  const previous = deliveries.get(node);
  if (previous) {
    previous.type |= bit;
    if (payload !== undefined) (previous.payload ??= {})[bit] = payload;
    if (options !== undefined) (previous.options ??= {})[bit] = options;
  } else deliveries.set(node, {
    type: bit,
    payload: payload === undefined ? undefined : { [bit]: payload },
    options: options === undefined ? undefined : { [bit]: options },
  });
  const queued = node.runtime.queuedEvents ??= new Map();
  const pending = queued.get(node);
  if (pending) pending.type |= bit;
  else queued.set(node, { type: bit });
};
