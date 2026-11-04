import type { FieldNodeDelivery, FieldNodeRecord } from '../../../record';
import { deliverWave } from './deliverWave';
import { resolveFieldNodeChainRoot } from './resolveFieldNodeChainRoot';

/**
 * Drain committed deliveries in fixed waves after the outer write settles; a
 * listener that adopts the chain moves the remaining waves to the adopting root.
 * @param root - Live tree root retaining the event table
 * @returns Nothing; failures remain on the chain until exit
 */
export const runDeliveryWaves = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  let active = resolveFieldNodeChainRoot(root);
  let waves = 0;
  while (active.runtime.deliveries?.size) {
    const runtime = active.runtime;
    const pending: [Self, FieldNodeDelivery][] = [];
    for (const node of runtime.deliveries ?? []) {
      if (node.pendingDelivery) pending.push([node, node.pendingDelivery]);
      node.pendingDelivery = undefined;
    }
    runtime.deliveries = new Set();
    waves += 1;
    runtime.feedbackBudget = waves - 1;
    deliverWave(active, pending);
    active = resolveFieldNodeChainRoot(active);
  }
};
