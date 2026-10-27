import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';
import { markRestoredSlotRaw } from './markRestoredSlotRaw';
import { readSlotRawTree } from './readSlotRawTree';

/**
 * Rebind a moved candidate to a different blueprint while preserving every child kind.
 * @param node - Fresh destination occurrence with no previously published lifetime
 * @param source - Immutable source occurrence, absent for an input-only candidate
 * @param overlay - Owner patch over the source's original declaration
 * @param context - Structural replay and fixed-baseline entry work
 * @returns Nothing; child sources have fresh parent chains and ordinary input is distributed
 */
export const restoreTransferredSlotSource = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  context: SettlementContext<Self>,
): void => {
  const template = source?.blueprintNode ?? node.blueprintNode;
  const input = readSlotRawTree(template, source, overlay);
  for (const entry of getSlotEntries(source, overlay, template)) {
    const prior = getSlotSource(source, entry, overlay);
    if (prior.source)
      (node.inactiveSlots ??= new Map<BlueprintChildEntry, Self>()).set(
        entry,
        cloneSlotSubtree(node, entry, prior.source, context, false),
      );
    if (prior.overlay)
      (node.inactiveSlotOverlays ??= new Map()).set(entry, prior.overlay);
  }
  markWrite(node, input, context);
  const distribution = context.distributedInputs.get(node);
  if (distribution)
    context.distributedInputs.set(node, {
      ...distribution,
      preserveLatent: true,
    });
  markRestoredSlotRaw(node, context);
};
