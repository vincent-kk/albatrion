import { StaticFirstLoadCapability } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { engineModes } from '../../../../utils/cache/engineModes';
import type { SettlementContext } from '../../../types/settlement';
import { watchWriteEpoch } from './watchWriteEpoch';

/**
 * Issue a tree-local generation only for a static, independent whole host write.
 * @param context - Caller context before pruning latent sources or marking input
 * @returns Nothing; eligible marking uses the generation until a shape check fails
 */
export const prepareWriteEpoch = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const node = context.target;
  const runtime = node.runtime;
  if (
    node.behavior.strategy !== 'branch' ||
    node.detached ||
    node.disposed ||
    context.replaceScope !== node ||
    (context.kind !== 'callerReplace' && context.kind !== 'input') ||
    context.replacePaths !== undefined ||
    runtime.batchDepth ||
    runtime.visitDepth ||
    (runtime.literalStarRaw?.size ?? 0) ||
    runtime.literalStarRawDirty ||
    context.root.inactiveSlots?.size ||
    context.root.inactiveSlotOverlays?.size ||
    context.root.inactiveSlotChildren?.size ||
    runtime.misfitPaths.size ||
    !StaticFirstLoadCapability.has(runtime.blueprint)
  )
    return;
  const epoch = (runtime.writeEpoch ?? 0) + 1;
  if (!Number.isSafeInteger(epoch)) return;
  runtime.writeEpoch = epoch;
  context.writeEpoch = epoch;
  if (engineModes.gateSelection === 'verify') watchWriteEpoch(context);
};
