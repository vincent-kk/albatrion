import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import type { CompactedSlotSources } from '../../types/slots';
import { DetachedWriteAddress } from '../detached/DetachedWriteAddress';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotOrder } from './getSlotOrder';
import { hasAdditionalInactiveSources } from './hasAdditionalInactiveSources';
import { markRestoredSlotRaw } from './markRestoredSlotRaw';

/**
 * Rebind retained state without sharing any node or parent link with its source.
 * @param host - New parent that owns the clone's address and array nonce
 * @param entry - Canonical binding to instantiate
 * @param source - Immutable source occurrence whose raw channels are retained
 * @param context - Entry sets and fixed-baseline recalculation work
 * @param entering - Whether this subtree is entering rather than remaining a candidate
 * @param compactions - Exit-only rebinding plans; ordinary entry clones and kind transfers omit them. Every source occurrence of an exit clone shares its clone's detached write address, so a later compaction of the clone also moves or drops the original references
 * @returns A new subtree whose inactive candidates also have newly bound parents
 */
export const cloneSlotSubtree = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  source: Self,
  context: SettlementContext<Self>,
  entering: boolean,
  compactions?: ReadonlyMap<Self, CompactedSlotSources<Self>>,
): Self => {
  const node = host.runtime.nodeFactory(entry, host, host.runtime, source);
  if (!entering) {
    const address = {
      path: node.path,
      order: getSlotOrder(host, entry.name, entry.node),
    };
    DetachedWriteAddress.transfer(source, address, node.runtime);
    if (compactions) DetachedWriteAddress.retain(source, address, node.runtime);
    DetachedWriteAddress.retain(node, address, node.runtime);
  }
  node.raw = source.raw;
  node.undeclaredValues = source.undeclaredValues;
  node.itemCount = source.itemCount;
  node.nextItemKey = source.nextItemKey;
  if (source.inactiveValueMemo !== undefined)
    node.inactiveValueMemo = source.inactiveValueMemo;
  if (
    source.inactiveValuesCache?.length &&
    !hasAdditionalInactiveSources(source)
  ) {
    node.inactiveValuesCache = source.inactiveValuesCache;
    node.inactiveValuesDirty = true;
  }
  if (host.behavior.type === 'array' && host.behavior.strategy === 'branch')
    node.itemKey = host.nextItemKey++;
  if (!entering) {
    node.active = false;
    node.detached = true;
    node.retainedSourceOverlay = source.retainedSourceOverlay;
    if (hasOwnProperty(source, 'retainedExitPolicy'))
      node.retainedExitPolicy = source.retainedExitPolicy;
  }
  const compaction = compactions?.get(source);
  if (compaction) {
    node.itemCount = compaction.itemCount;
    node.structure = Object.create(null);
    node.children = [];
    node.inactiveSlots = new Map();
    node.inactiveSlotOverlays = new Map(compaction.overlays);
    for (const discarded of compaction.discarded)
      DetachedWriteAddress.discard(discarded, node.runtime);
    for (const [binding, retained] of compaction.sources)
      node.inactiveSlots.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && source.inactiveSlotOverlays?.size)
    node.inactiveSlotOverlays = new Map(source.inactiveSlotOverlays);
  if (!compaction && source.inactiveSlots?.size) {
    node.inactiveSlots = new Map();
    for (const [binding, retained] of source.inactiveSlots)
      node.inactiveSlots.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && source.children && source.structure) {
    const structure: Record<string, Self> = Object.create(null);
    const children: Self[] = [];
    for (const child of source.children) {
      if (child.parent !== source) continue;
      const binding = getRetainedChildEntry(
        node,
        child.name,
        child.blueprintNode,
      );
      if (!binding) continue;
      const copied = cloneSlotSubtree(
        node,
        binding,
        child,
        context,
        entering,
        compactions,
      );
      structure[binding.name] = copied;
      children.push(copied);
      if (
        copied.inactiveSlots?.size ||
        copied.inactiveSlotOverlays?.size ||
        copied.inactiveSlotChildren?.size
      )
        (node.inactiveSlotChildren ??= new Map()).set(binding.name, copied);
    }
    node.structure = structure;
    node.children = children;
  }
  if (entering) {
    if (node.behavior.type === 'array' && node.behavior.strategy === 'branch')
      context.arrayCounts.set(node, 0);
    markRestoredSlotRaw(node, context);
    context.entered.add(node);
    context.changedNodes.add(node);
    context.dirtyPaths.add(node.path);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  return node;
};
