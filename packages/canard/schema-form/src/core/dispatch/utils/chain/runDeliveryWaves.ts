import type { SchemaNodeRecord } from '../../../record';
import { deliverWave } from './deliverWave';

/**
 * Drain committed deliveries in fixed waves after the outer write settles.
 * @param root - Live tree root retaining the event table
 * @returns Nothing; failures remain on the chain until exit
 */
export const runDeliveryWaves = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  let waves = 0;
  while (runtime.deliveries?.size) {
    const pending = runtime.deliveries;
    runtime.deliveries = new Map();
    waves += 1;
    runtime.feedbackBudget = waves - 1;
    deliverWave(root, pending);
  }
};
