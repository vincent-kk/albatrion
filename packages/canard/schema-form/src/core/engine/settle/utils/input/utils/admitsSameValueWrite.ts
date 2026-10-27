import { StaticFirstLoadCapability } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Tell whether a host distribution may skip same-value leaves and keep the host out of shape-dirty (W1).
 * Every condition is a fixed number of reads; the host's own key-set condition belongs to the caller.
 * @param node - Branch host being distributed by `markWrite`
 * @param context - Current settlement whose write kind, scope, gate presence and written target are read
 * @returns Whether the write is a caller write of a static form outside batch, visit and load marking, with no pending latent change, no latent raw or misfit path at or under the written target, on an attached host
 */
export const admitsSameValueWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const runtime = node.runtime;
  const scope = context.target.path;
  return !(
    context.kind === 'load' ||
    context.kind === 'automatic' ||
    context.automatic ||
    context.hasGates ||
    context.loadScope !== undefined ||
    context.replacePaths !== undefined ||
    node.detached ||
    runtime.batchDepth ||
    runtime.visitDepth ||
    !StaticFirstLoadCapability.has(runtime.blueprint) ||
    runtime.latentRaw.pathIndex.under(scope).size > 0 ||
    runtime.latentRawDirty ||
    context.target.inactiveSlots?.size ||
    context.target.inactiveSlotOverlays?.size ||
    context.target.inactiveSlotChildren?.size ||
    runtime.misfitPaths.pathIndex.under(scope).size > 0
  );
};
