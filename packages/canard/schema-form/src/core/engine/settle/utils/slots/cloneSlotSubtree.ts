import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import type { CompactedSlotSources } from '../../types/slots';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { hasAdditionalInactiveSources } from './hasAdditionalInactiveSources';
import { markRestoredSlotSource } from './markRestoredSlotSource';

/** Annotates the lazily created `__inactiveSlotChildren__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotChildren<Self> = Map<string, Self>;

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
  node.__itemCount__ = instance.__itemCount__;
  node.__nextItemKey__ = instance.__nextItemKey__;
  if (instance.__inactiveSlotValue__ !== undefined)
    node.__inactiveSlotValue__ = instance.__inactiveSlotValue__;
  if (
    instance.__inactiveValues__?.length &&
    !hasAdditionalInactiveSources(instance)
  ) {
    node.__inactiveValues__ = instance.__inactiveValues__;
    node.__isInactiveValuesDirty__ = true;
  }
  if (host.behavior.type === 'array' && host.behavior.strategy === 'branch')
    node.__itemKey__ = host.__nextItemKey__++;
  if (!entering) {
    node.isActive = false;
    node.isDetached = true;
    node.__retainedSourceOverlay__ = instance.__retainedSourceOverlay__;
    if (hasOwnProperty(instance, '__shouldUnsetOnInactive__'))
      node.__shouldUnsetOnInactive__ = instance.__shouldUnsetOnInactive__;
  }
  const compaction = compactions?.get(instance);
  if (compaction) {
    node.__itemCount__ = compaction.itemCount;
    node.__childrenByName__ = Object.create(null);
    node.children = [];
    node.__inactiveSlots__ = new Map();
    node.__inactiveSlotOverlays__ = new Map(compaction.overlays);
    for (const [binding, retained] of compaction.sources)
      node.__inactiveSlots__.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && instance.__inactiveSlotOverlays__?.size)
    node.__inactiveSlotOverlays__ = new Map(instance.__inactiveSlotOverlays__);
  if (!compaction && instance.__inactiveSlots__?.size) {
    node.__inactiveSlots__ = new Map();
    for (const [binding, retained] of instance.__inactiveSlots__)
      node.__inactiveSlots__.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false, compactions),
      );
  }
  if (!compaction && instance.children && instance.__childrenByName__) {
    const childrenByName: Dictionary<Self> = Object.create(null);
    const children: Self[] = [];
    for (const child of instance.children) {
      if (child.__parent__ !== instance) continue;
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
      childrenByName[binding.name] = copied;
      children.push(copied);
      if (
        copied.__inactiveSlots__?.size ||
        copied.__inactiveSlotOverlays__?.size ||
        copied.__inactiveSlotChildren__?.size
      ) {
        const slotChildren: InactiveSlotChildren<Self> =
          (node.__inactiveSlotChildren__ ??= new Map());
        slotChildren.set(binding.name, copied);
      }
    }
    node.__childrenByName__ = childrenByName;
    node.children = children;
  }
  if (entering) {
    if (node.behavior.type === 'array' && node.behavior.strategy === 'branch')
      context.arrayCounts.set(node, 0);
    markRestoredSlotSource(node, context);
    context.enteredNodes.add(node);
    context.changedNodes.add(node);
    context.dirtyPaths.add(node.path);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  return node;
};
