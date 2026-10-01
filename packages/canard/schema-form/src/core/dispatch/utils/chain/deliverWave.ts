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
  root: Self, pending: Map<unknown, SchemaNodeDelivery>,
): void => {
  const runtime = root.runtime;
  const nodes = [...pending.keys()].filter((node) => isWaveNode<Self>(node, runtime));
  nodes.sort(compareDocumentOrder);
  const fixed = new Map(nodes.map((node) => [node, [...runtime.listeners?.get(node) ?? []]]));
  runtime.delivering = true;
  try {
    for (const node of nodes) {
      if (node.detached) continue;
      const event = pending.get(node);
      if (!event) continue;
      for (const listener of fixed.get(node) ?? []) {
        if (!runtime.listeners?.get(node)?.has(listener) ||
          runtime.feedbackBlockedListeners?.has(listener)) continue;
        runtime.currentListener = listener;
        try { listener(event); }
        catch (error) { captureChainError(runtime, error); }
        finally { runtime.currentListener = undefined; }
      }
    }
  } finally {
    runtime.delivering = false;
  }
};
