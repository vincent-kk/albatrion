import { StaticFirstLoadCapability } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Tell whether a host distribution may skip same-value leaves and keep the host out of shape-dirty (W1).
 * Every condition is a fixed number of reads; the host's own key-set condition belongs to the caller.
 * @param node - Branch host being distributed by `markWrite`
 * @param context - Current settlement whose write kind, scope and gate presence are read
 * @returns Whether the write is a caller write of a static form outside batch, visit and load marking, with no latent raw, pending latent change or misfit path, on an attached host
 */
export const admitsSameValueWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const runtime = node.runtime;
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
    runtime.latentRaw.size > 0 ||
    runtime.latentRawDirty ||
    runtime.misfitPaths.size > 0
  );
};
