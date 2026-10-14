import type { FieldNodeDelivery, FieldNodeRecord } from '../../../record';
import { deliverWave } from './deliverWave';

/**
 * Drain committed deliveries in fixed waves after the outer write settles.
 * @param root - Live tree root retaining the event table
 * @returns Nothing; failures remain on the chain until exit
 */
export const runDeliveryWaves = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  let waves = 0;
  while (runtime.deliveries?.size) {
    const pending: [Self, FieldNodeDelivery][] = [];
    for (const node of runtime.deliveries) {
      if (node.pendingDelivery) pending.push([node, node.pendingDelivery]);
      node.pendingDelivery = undefined;
    }
    runtime.deliveries = new Set();
    waves += 1;
    runtime.feedbackBudget = waves - 1;
    deliverWave(root, pending);
  }
};
