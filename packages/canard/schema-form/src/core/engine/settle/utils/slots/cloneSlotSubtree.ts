import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import type { CompactedSlotSources } from '../../types/slots';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { hasAdditionalInactiveSources } from './hasAdditionalInactiveSources';
import { markRestoredSlotSource } from './markRestoredSlotSource';

/**
 * Rebind retained state without sharing any node or parent link with its source.
 * @param host - New parent that owns the clone's address and array nonce
 * @param entry - Canonical binding to instantiate
 * @param instance - Immutable source occurrence whose source channels are retained
 * @param context - Entry sets and fixed-baseline recalculation work
 * @param entering - Whether this subtree is entering rather than remaining a candidate
 * @param compactions - Exit-only rebinding plans; ordinary entry clones and kind transfers omit them
 * @returns A new subtree whose inactive candidates also have newly bound parents
 */
export const cloneSlotSubtree = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  instance: Self,
  context: SettlementContext<Self>,
  entering: boolean,
  compactions?: ReadonlyMap<Self, CompactedSlotSources<Self>>,
): Self => {
  const node = host.runtime.nodeFactory(entry, host, host.runtime, instance);
  node.source = instance.source;
  node.extras = instance.extras;
  node.itemCount = instance.itemCount;
  node.nextItemKey = instance.nextItemKey;
  if (instance.inactiveValueMemo !== undefined)
    node.inactiveValueMemo = instance.inactiveValueMemo;
  if (
    instance.inactiveValuesCache?.length &&
    !hasAdditionalInactiveSources(instance)
  ) {
    node.inactiveValuesCache = instance.inactiveValuesCache;
    node.inactiveValuesDirty = true;
  }
  if (host.behavior.type === 'array' && host.behavior.strategy === 'branch')
    node.itemKey = host.nextItemKey++;
  if (!entering) {
    node.isActive = false;
    node.detached = true;
    node.retainedSourceOverlay = instance.retainedSourceOverlay;
    if (hasOwnProperty(instance, 'retainedExitPolicy'))
      node.retainedExitPolicy = instance.retainedExitPolicy;
  }
  const compaction = compactions?.get(instance);
  if (compaction) {
    node.itemCount = compaction.itemCount;
    node.structure = Object.create(null);
    node.children = [];
    node.inactiveSlots = new Map();
    node.inactiveSlotOverlays = new Map(compaction.overlays);
    for (const [binding, retained] of compaction.sources)
      node.inactiveSlots.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && instance.inactiveSlotOverlays?.size)
    node.inactiveSlotOverlays = new Map(instance.inactiveSlotOverlays);
  if (!compaction && instance.inactiveSlots?.size) {
    node.inactiveSlots = new Map();
    for (const [binding, retained] of instance.inactiveSlots)
      node.inactiveSlots.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && instance.children && instance.structure) {
    const structure: Dictionary<Self> = Object.create(null);
    const children: Self[] = [];
    for (const child of instance.children) {
      if (child.parent !== instance) continue;
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
    markRestoredSlotSource(node, context);
    context.entered.add(node);
    context.changedNodes.add(node);
    context.dirtyPaths.add(node.path);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  return node;
};
