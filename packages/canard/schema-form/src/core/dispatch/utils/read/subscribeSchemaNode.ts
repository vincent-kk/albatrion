import type { SchemaNodeRecord } from '../../../record';
import type { SchemaNodeListener } from '../../type';

/**
 * Subscribe to future deliveries for one occurrence.
 * @param node - Occurrence whose events are observed
 * @param listener - Called once for a merged event in each wave
 * @returns Cleanup that takes effect even during an active wave
 */
export const subscribeSchemaNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self, listener: SchemaNodeListener,
): (() => void) => {
  const runtime = node.rootNode.runtime;
  const listeners = runtime.listeners ?? new Map();
  const subscriptions = listeners.get(node) ?? new Set();
  subscriptions.add(listener);
  listeners.set(node, subscriptions);
  runtime.listeners = listeners;
  return () => {
    subscriptions.delete(listener);
    if (!subscriptions.size) listeners.delete(node);
  };
};
