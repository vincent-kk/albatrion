import type { FieldNodeRecord } from '../types/record';

/**
 * Admit only an unobserved outer public commit without an event to merge.
 * @param node - Candidate retaining any authoritative pending previous value
 * @returns Whether bits can advance without an event envelope or payload
 */
export const canOmitFieldNodePayload = <Self>(
  node: FieldNodeRecord<Self>,
): boolean =>
  node.runtime.entryDepth === 1 &&
  !node.runtime.listeners?.size &&
  !node.runtime.revisionObserved &&
  !node.pendingDelivery;
