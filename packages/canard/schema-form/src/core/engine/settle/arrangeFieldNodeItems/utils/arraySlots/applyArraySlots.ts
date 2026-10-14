import { isArray } from '@winglet/common-utils/filter';

import { getItemEntry } from '../../../../blueprint';
import { visitFieldNodes } from '../../../../navigation';
import { captureFieldNodeChange } from '../../../../record';
import type { ArrayArrangePlan, FieldNodeRecord } from '../../../../record';
import { updateFieldNodeNameAndPath } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { createChildNode } from '../../../utils/compute/createChildNode';
import { captureDetachedFieldNodeReads } from '../../../utils/detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../../../utils/gates/getGateRegistry';
import { arrayExtras } from '../../../utils/input/arrayExtras';
import { markWrite } from '../../../utils/input/markWrite';
import { readRawTree } from '../../../utils/latent/readRawTree';
import { indexEnteredLatentKey } from '../../../utils/latentStore/indexEnteredLatentKey';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';
import { setLoadValue } from '../../../utils/loadValues/setLoadValue';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import { rekeyArrayRuntimePaths } from '../rekey/rekeyArrayRuntimePaths';
import type { ArrayPathMove } from '../rekey/rekeyArrayRuntimePaths';
import { applyArrayTail } from './applyArrayTail';
import { canApplyArrayTail } from './canApplyArrayTail';

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
      previous: host.path + '/' + index,
      current: current === undefined ? undefined : host.path + '/' + current,
    });
    if (!item || reused.has(item)) continue;
    context.perished.add(item);
    visitFieldNodes(
      item,
      (departing) => {
        if (!departing.runtime.detachedReads?.has(departing))
          captureDetachedFieldNodeReads(departing, {
            emit: context.previousEmit,
            context: context.previousContext,
            schema: departing.schema.schema,
          });
      },
      { owned: true },
    );
    (perishedPaths ??= new Set()).add(item.path);
  }
  if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves);
  context.latentDescendantKeys = undefined;
  context.enteredLatentKeys = undefined;

  for (const [name, item] of Object.entries(nextItems)) {
    if (!reused.has(item) || item.name === name) continue;
    visitFieldNodes(
      item,
      (descendant) => {
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
      },
      { owned: true },
    );
  }
  host.itemCount = plan.slots.length;
  host.raw = undefined;
  host.undeclaredValues = arrayExtras(host, nextRaw);
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
      visitFieldNodes(
        item,
        (node) => {
          registry.register(node);
        },
        { owned: true },
      );
  host.runtime.loadSnapshot = setLoadValue(
    host.runtime.loadSnapshot,
    host.path,
    nextSnapshot,
  );
  return removed;
};
