import { isArray } from '@winglet/common-utils/filter';

import { getItemEntries } from '../../../../blueprint';
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
 * Read the host's composed raw tree as slots.
 * @param host - Live array occurrence before its plan is applied
 * @param context - Settlement holding retained sources beneath the host
 * @returns Raw slots, or none when the tree is not an array
 */
const readRawSlots = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  context: SettlementContext<Self>,
): readonly unknown[] => {
  const raw = readRawTree(host, context);
  return isArray(raw) ? raw : [];
};

/**
 * Apply a branch plan before calculation while paths are free to change.
 * The host's raw tree is composed only when a slot reads it: extras, a whole raw, or a removed or retained slot without a live node.
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
  // With an item template and no tuple positions, extras or whole raw, only a slot without a live node reads raw.
  let rawSlots =
    host.raw === undefined &&
    host.blueprintNode.item &&
    !host.blueprintNode.prefixItems?.length &&
    host.undeclaredValues === undefined
      ? undefined
      : readRawSlots(host, context);
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
        : (rawSlots ??= readRawSlots(host, context))[removedIndex];
  const registry = getGateRegistry(host.runtime);
  if (context.hasGates)
    for (const item of host.children ?? []) registry.remove(item);

  const nextItems: Record<string, Self> = Object.create(null);
  const nextRaw: unknown[] = [];
  const nextSnapshot: unknown[] = [];
  const reused = new Set<Self>();
  const created: { node: Self; value: unknown }[] = [];
  let deferred = false;
  const destinations = new Map<number, number>();
  for (let index = 0; index < plan.slots.length; index++) {
    const slot = plan.slots[index];
    const from = 'from' in slot ? slot.from : undefined;
    const value = 'value' in slot ? slot.value : rawSlots?.[slot.from];
    nextRaw.push(value);
    nextSnapshot.push('value' in slot ? slot.value : oldSnapshot[slot.from]);
    const candidates = getItemEntries(host.blueprintNode, index);
    const entry = candidates[0];
    if (!entry) continue;
    const old = from === undefined ? undefined : oldItems[String(from)];
    if (
      old &&
      candidates.some((candidate) => old.blueprintNode === candidate.node)
    ) {
      nextItems[String(index)] = old;
      reused.add(old);
      destinations.set(from!, index);
      continue;
    }
    const source =
      from === undefined || rawSlots
        ? value
        : (rawSlots = readRawSlots(host, context))[from];
    if (from !== undefined && !old) destinations.set(from, index);
    if (candidates.length > 1) {
      nextRaw[index] = source;
      deferred = true;
      continue;
    }
    const node = createChildNode(host, entry);
    nextItems[String(index)] = node;
    created.push({ node, value: source });
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
  if (deferred)
    context.distributedInputs.set(host, {
      input: nextRaw,
      whole: false,
      automatic: false,
    });
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
