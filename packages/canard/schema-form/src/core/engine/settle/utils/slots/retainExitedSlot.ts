import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isReplacedLivePath } from '../transition/isReplacedLivePath';
import { readDepartingAncestorPolicy } from '../transition/readDepartingAncestorPolicy';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { createExitSlotOverlay } from './createExitSlotOverlay';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { markSlotChange } from './markSlotChange';

/**
 * Retain an exit's instance and source policy without a latent serialization.
 * @param node - Finally detached top occurrence outside load and perished scopes
 * @param context - Last-live policies and the host's next publication
 * @param applyPolicy - Whether automatic exit clearing applies to this occurrence
 * @returns Nothing; a fully cleared occurrence has no retained slot
 */
export const retainExitedSlot = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  applyPolicy: boolean,
): void => {
  const host = node.parent;
  if (!host) return;
  const entry = getRetainedChildEntry(host, node.name, node.blueprintNode);
  if (!entry) return;
  if (isReplacedLivePath(context, node.path)) {
    markSlotChange(host, entry, undefined, context);
    host.inactiveSlots?.delete(entry);
    host.inactiveSlotOverlays?.delete(entry);
    return;
  }
  const result = createExitSlotOverlay(
    node,
    readDepartingAncestorPolicy(context, node),
    applyPolicy,
    undefined,
    context,
  );
  node.retainedSourceOverlay = result.overlay;
  markSlotChange(host, entry, context.entered.has(node) ? undefined : node);
  if (!result.retain) {
    host.inactiveSlots?.delete(entry);
    host.inactiveSlotOverlays?.delete(entry);
    return;
  }
  const source = result.compacted
    ? cloneSlotSubtree(
        host,
        entry,
        node,
        context,
        false,
        context.compactedSlotSources,
      )
    : node;
  (host.inactiveSlots ??= new Map()).set(entry, source);
  if (result.overlay)
    (host.inactiveSlotOverlays ??= new Map()).set(entry, result.overlay);
  else host.inactiveSlotOverlays?.delete(entry);
};
