import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getRetainedChildEntry } from './getRetainedChildEntry';

/**
 * Rebind retained state without sharing any node or parent link with its source.
 * @param host - New parent that owns the clone's address and array nonce
 * @param entry - Canonical binding to instantiate
 * @param source - Immutable source occurrence whose raw channels are retained
 * @param context - Entry sets and fixed-baseline recalculation work
 * @param entering - Whether this subtree is entering rather than remaining a candidate
 * @returns A new subtree whose inactive candidates also have newly bound parents
 */
export const cloneSlotSubtree = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  source: Self,
  context: SettlementContext<Self>,
  entering: boolean,
): Self => {
  const node = host.runtime.nodeFactory(entry, host, host.runtime, source);
  node.raw = source.raw;
  node.undeclaredValues = source.undeclaredValues;
  node.itemCount = source.itemCount;
  node.nextItemKey = source.nextItemKey;
  if (host.behavior.type === 'array' && host.behavior.strategy === 'branch')
    node.itemKey = host.nextItemKey++;
  if (!entering) {
    node.active = false;
    node.detached = true;
    node.inactiveValueMemo = source.inactiveValueMemo;
    if (hasOwnProperty(source, 'retainedExitPolicy'))
      node.retainedExitPolicy = source.retainedExitPolicy;
  }
  if (source.inactiveSlotOverlays?.size)
    node.inactiveSlotOverlays = new Map(source.inactiveSlotOverlays);
  if (source.inactiveSlots?.size) {
    node.inactiveSlots = new Map();
    for (const [binding, retained] of source.inactiveSlots)
      node.inactiveSlots.set(
        binding,
        cloneSlotSubtree(node, binding, retained, context, false),
      );
  }
  if (source.children && source.structure) {
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
      const copied = cloneSlotSubtree(node, binding, child, context, entering);
      structure[binding.name] = copied;
      children.push(copied);
    }
    node.structure = structure;
    node.children = children;
  }
  if (entering) {
    context.entered.add(node);
    context.dirtyPaths.add(node.path);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
    if (context.hasGates) getGateRegistry(node.runtime).register(node);
  }
  return node;
};
