import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';
import { markRestoredSlotSource } from './markRestoredSlotSource';
import { readSlotSourceTree } from './readSlotSourceTree';

/**
 * Rebind a moved candidate to a different blueprint while preserving every child kind.
 * @param node - Fresh destination occurrence with no previously published lifetime
 * @param instance - Immutable source occurrence, absent for an input-only candidate
 * @param overlay - Owner patch over the source's original declaration
 * @param context - Structural replay and fixed-baseline entry work
 * @returns Nothing; child sources have fresh parent chains and ordinary input is distributed
 */
export const restoreTransferredSlotSource = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  instance: Optional<Self>,
  overlay: Optional<InactiveSlotOverlay>,
  context: SettlementContext<Self>,
): void => {
  const template = instance?.blueprintNode ?? node.blueprintNode;
  const input = readSlotSourceTree(template, instance, overlay);
  for (const entry of getSlotEntries(instance, overlay, template)) {
    const prior = getSlotSource(instance, entry, overlay);
    if (prior.instance)
      (node.inactiveSlots ??= new Map<BlueprintChildEntry, Self>()).set(
        entry,
        cloneSlotSubtree(node, entry, prior.instance, context, false),
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
  markRestoredSlotSource(node, context);
};
