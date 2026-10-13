import { isArray } from '@winglet/common-utils/filter';

import { getItemEntry } from '../../../blueprint';
import { captureFieldNodeChange } from '../../../record';
import type { ArrayArrangePlan, FieldNodeRecord } from '../../../record';
import { updateFieldNodeNameAndPath } from '../../../record';
import type { SettlementContext } from '../../type';
import { createChildNode } from '../compute/createChildNode';
import { captureDetachedFieldNodeReads } from '../detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { indexEnteredLatentKey } from '../latent/indexEnteredLatentKey';
import { readRawTree } from '../latent/readRawTree';
import { getLoadValue } from '../load/getLoadValue';
import { setLoadValue } from '../load/setLoadValue';
import { prunePerishedPaths } from '../transition/prunePerishedPaths';
import { walkOwnedFieldNodes } from '../walkOwnedFieldNodes';
import { arrayExtras } from '../write/arrayExtras';
import { markWrite } from '../write/markWrite';
import { applyArrayTail } from './applyArraySlots/utils/applyArrayTail';
import { canApplyArrayTail } from './applyArraySlots/utils/canApplyArrayTail';
import { rekeyArrayRuntimePaths } from './rekeyArrayRuntimePaths';
import type { ArrayPathMove } from './rekeyArrayRuntimePaths';

/**
 * Apply a branch plan before calculation while paths are free to change.
 * @param host - Live array occurrence whose positions the plan replaces
 * @param plan - Pure source-position proposal from the array behavior
 * @param context - One settlement's entered, perished, and changed-path facts
 * @returns Last committed value of a removed position, if requested
 */
export const applyArraySlots = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
  context: SettlementContext<Self>,
): unknown => {
  if (canApplyArrayTail(host, plan)) return applyArrayTail(host, plan, context);
  const oldCount = host.itemCount;
  const oldItems = host.structure ?? {};
  const oldRaw = readRawTree(host, context);
  const rawSlots = isArray(oldRaw) ? oldRaw : [];
  const snapshot = getLoadValue(host.runtime.loadSnapshot, host.path);
  const oldSnapshot = isArray(snapshot) ? snapshot : [];
  const removedIndex =
    plan.result.source === 'removed' ? plan.result.index : -1;
  const removedItem = oldItems[String(removedIndex)];
  const removed =
    removedIndex < 0
      ? undefined
      : removedItem
        ? removedItem.local
        : rawSlots[removedIndex];
  const registry = getGateRegistry(host.runtime);
  if (context.hasGates)
    for (const item of host.children ?? []) registry.remove(item);

  const nextItems: Record<string, Self> = Object.create(null);
  const nextRaw: unknown[] = [];
  const nextSnapshot: unknown[] = [];
  const reused = new Set<Self>();
  const created: { node: Self; value: unknown }[] = [];
  const destinations = new Map<number, number>();
  for (let index = 0; index < plan.slots.length; index++) {
    const slot = plan.slots[index];
    const from = 'from' in slot ? slot.from : undefined;
    const value = 'value' in slot ? slot.value : rawSlots[slot.from];
    nextRaw.push(value);
    nextSnapshot.push('value' in slot ? slot.value : oldSnapshot[slot.from]);
    const entry = getItemEntry(host.blueprintNode, index);
    if (!entry) continue;
    const old = from === undefined ? undefined : oldItems[String(from)];
    if (old && old.blueprintNode === entry.node) {
      nextItems[String(index)] = old;
      reused.add(old);
      destinations.set(from!, index);
      continue;
    }
    const node = createChildNode(host, entry);
    nextItems[String(index)] = node;
    created.push({ node, value });
  }

  const moves: ArrayPathMove[] = [];
  let perishedPaths: Set<string> | undefined;
  for (let index = 0; index < oldCount; index++) {
    const item = oldItems[String(index)];
    const current = destinations.get(index);
    moves.push({
      previous: `${host.path}/${index}`,
      current: current === undefined ? undefined : `${host.path}/${current}`,
    });
    if (!item || reused.has(item)) continue;
    context.perished.add(item);
    walkOwnedFieldNodes(item, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedFieldNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: departing.schema.schema,
        });
    });
    (perishedPaths ??= new Set()).add(item.path);
  }
  if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves);
  context.latentDescendantKeys = undefined;
  context.enteredLatentKeys = undefined;

  for (const [name, item] of Object.entries(nextItems)) {
    if (!reused.has(item) || item.name === name) continue;
    walkOwnedFieldNodes(item, (descendant) => {
      const previous = descendant.path;
      updateFieldNodeNameAndPath(
        descendant,
        descendant === item ? name : descendant.name,
        descendant === item ? host : descendant.parent,
      );
      context.pathChanges.push({
        node: descendant,
        previous,
        current: descendant.path,
      });
      context.dirtyPaths.add(descendant.path);
      if (descendant.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(descendant.path);
      context.changedNodes.add(descendant);
    });
  }
  host.itemCount = plan.slots.length;
  host.raw = undefined;
  host.extras = arrayExtras(host, nextRaw);
  host.structure = nextItems;
  host.children = captureFieldNodeChange(
    host,
    'children',
    Object.values(nextItems),
  );
  context.arrayCounts.set(host, oldCount);
  context.changedRaw.add(host.path);
  context.changedNodes.add(host);
  context.dirtyPaths.add(host.path);
  context.shapeDirtyPaths.add(host.path);
  for (const { node, value } of created) {
    context.entered.add(node);
    indexEnteredLatentKey(context, node);
    markWrite(node, value, context);
  }
  if (context.hasGates)
    for (const item of host.children)
      walkOwnedFieldNodes(item, (node) => registry.register(node));
  host.runtime.loadSnapshot = setLoadValue(
    host.runtime.loadSnapshot,
    host.path,
    nextSnapshot,
  );
  return removed;
};
