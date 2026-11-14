import type { FieldNodeRecord } from '../../../../record';
import { engineModes } from '../../../../utils/cache/engineModes';

/**
 * Admit the separate conditional route before any node mutation or commit reservation.
 * @param root - Newly attached root with immutable compiler evidence
 * @param value - Caller input; only undefined has a proven mount interpretation
 * @returns Whether freshness and the configured verifier permit prepared selection
 */
export const canLoadFixedFirstTree = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown,
): boolean =>
  value === undefined &&
  root.parent === null &&
  !root.disposed &&
  !root.detached &&
  !root.deliveryInitialized &&
  !root.runtime.commitNumber &&
  !root.children?.length &&
  !root.pendingDelivery &&
  !root.pendingRevision &&
  root.source === undefined &&
  root.extras === undefined &&
  !root.runtime.deliveries?.size &&
  root.runtime.globalStateCounts.size === 0 &&
  root.runtime.blueprint.fixedFirstLoadPlan !== undefined &&
  engineModes.gateSelection !== 'verify' &&
  engineModes.gateWheel !== 'shadow' &&
  !engineModes.deriveShadow;
