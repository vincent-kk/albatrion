import type { SchemaNodeDelivery, SchemaNodeRecord } from '../../../record';
import { compareDocumentOrder } from './utils/compareDocumentOrder';
import { captureChainError } from './captureChainError';

/**
 * Check that a pending key belongs to this tree's record shape.
 * @param value - Candidate key from the shared event table
 * @param runtime - Runtime that owns the wave
 * @returns Whether the key can be delivered as this tree's node
 */
const isWaveNode = <Self extends SchemaNodeRecord<Self>>(
  value: unknown, runtime: Self['runtime'],
): value is Self => value !== null && typeof value === 'object' &&
  Reflect.get(value, 'runtime') === runtime;

/**
 * Deliver one fixed pending set while isolating each subscriber failure.
 * @param root - Live tree root owning subscriptions
 * @param pending - Event set removed from the runtime before callbacks run
 * @returns Nothing; callback failures append to the current chain
 */
export const deliverWave = <Self extends SchemaNodeRecord<Self>>(
  root: Self, pending: readonly (readonly [Self, SchemaNodeDelivery])[],
): void => {
  const runtime = root.runtime;
  const fixed: { node: Self; event: SchemaNodeDelivery;
    listeners: ((event: SchemaNodeDelivery) => void)[] }[] = [];
  for (const [candidate, event] of pending) {
    if (!isWaveNode<Self>(candidate, runtime)) continue;
    const listeners = runtime.listeners?.get(candidate);
    if (listeners?.size) fixed.push({ node: candidate, event, listeners: [...listeners] });
  }
  const siblingIndexes = new Map<Self, Map<Self, number>>();
  fixed.sort((left, right) => compareDocumentOrder(left.node, right.node, siblingIndexes));
  for (const { node, event, listeners } of fixed) {
    if (node.detached) continue;
    for (const listener of listeners) {
      if (!runtime.listeners?.get(node)?.has(listener) ||
        runtime.feedbackBlockedListeners?.has(listener)) continue;
      runtime.currentListener = listener;
      try { listener(event); }
      catch (error) { captureChainError(runtime, error); }
      finally { runtime.currentListener = undefined; }
    }
  }
};
