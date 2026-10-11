import { StaticFirstLoadCapability } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Select the literal-default first-load path before any record or commit changes.
 * @param root - Newly built root with no previous shape or latent sources
 * @param value - Caller source; explicit inputs remain on the generic path
 * @returns Whether the compiler proved the approved, narrow first-load scope
 */
export const canLoadStaticFirstTree = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown,
): boolean => value === undefined && root.parent === null && !root.disposed &&
  !root.detached && !root.deliveryInitialized && !root.runtime.commitNumber &&
  !root.children?.length && !root.pendingDelivery && !root.pendingRevision &&
  root.raw === undefined && root.extras === undefined && !root.runtime.deliveries?.size &&
  root.runtime.latentRaw.size === 0 && root.runtime.globalStateCounts.size === 0 &&
  StaticFirstLoadCapability.has(root.runtime.blueprint);
