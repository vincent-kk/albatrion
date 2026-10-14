import { isArray } from '@winglet/common-utils/filter';

import { getItemEntry } from '../../../../blueprint';
import { visitFieldNodes } from '../../../../navigation';
import { captureFieldNodeChange } from '../../../../record';
import type { ArrayArrangePlan, FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { createChildNode } from '../../../utils/compute/createChildNode';
import { captureDetachedFieldNodeReads } from '../../../utils/detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../../../utils/gates/getGateRegistry';
import { markWrite } from '../../../utils/input/markWrite';
import { readLatentSlotSource } from '../../../utils/latent/readLatentSlotSource';
import { indexEnteredLatentKey } from '../../../utils/latentStore/indexEnteredLatentKey';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';
import { setLoadValue } from '../../../utils/loadValues/setLoadValue';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import type { ArrayPathMove } from '../../types/pathMoves';
import { rekeyArrayRuntimePaths } from '../rekey/rekeyArrayRuntimePaths';

/**
 * Apply a proven prefix-preserving proposal without composing retained raw trees.
 * Mutates `host.structure` in place, reusing prefix entries and adding or deleting only tail keys.
 * @param host - Live branch array with no whole raw override
 * @param plan - Proposal accepted by canApplyArrayTail; appended slots carry values
 * @param context - Settlement receiving the same lifecycle and dirty facts as a full plan
 * @returns Committed removed-slot value, or its retained source when no item is live
 */
export const applyArrayTail = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
  context: SettlementContext<Self>,
): unknown => {
  const oldCount = host.itemCount;
  const prefixCount = Math.min(oldCount, plan.slots.length);
  const items: Record<string, Self> = host.structure ?? Object.create(null);
  const snapshot = getLoadValue(host.runtime.loadSnapshot, host.path);
  const oldSnapshot = isArray(snapshot) ? snapshot : [];
  const oldExtras = isArray(host.undeclaredValues) ? host.undeclaredValues : [];
  const templateCount = host.blueprintNode.prefixItems?.length ?? 0;
  const removedIndex =
    plan.result.source === 'removed' ? plan.result.index : -1;
  const removedItem = items[String(removedIndex)];
  const removedEntry =
    removedIndex < 0
      ? undefined
      : getItemEntry(host.blueprintNode, removedIndex);
  const removed =
    removedIndex < 0
      ? undefined
      : removedItem
        ? removedItem.local
        : removedEntry
          ? readLatentSlotSource(
              context,
              host.path + '/' + removedIndex,
              removedEntry.node,
            )
          : oldExtras[removedIndex - templateCount];
  const registry = getGateRegistry(host.runtime);
  if (context.hasGates)
    for (const item of host.children ?? []) registry.remove(item);

  const children = (host.children ?? []).slice(0, prefixCount);
  const nextSnapshot: unknown[] = [];
  const extras: unknown[] = [];
  for (let index = 0; index < prefixCount; index++) {
    nextSnapshot.push(oldSnapshot[index]);
    if (!host.blueprintNode.item && index >= templateCount)
      extras.push(oldExtras[index - templateCount]);
  }
  const created: { node: Self; value: unknown }[] = [];
  for (let index = prefixCount; index < plan.slots.length; index++) {
    const slot = plan.slots[index];
    if (!('value' in slot)) continue;
    nextSnapshot.push(slot.value);
    const entry = getItemEntry(host.blueprintNode, index);
    if (!entry) {
      extras.push(slot.value);
      continue;
    }
    const node = createChildNode(host, entry);
    items[String(index)] = node;
    children.push(node);
    created.push({ node, value: slot.value });
  }

  const moves: ArrayPathMove[] = [];
  let perishedPaths: Set<string> | undefined;
  for (let index = prefixCount; index < oldCount; index++) {
    const item = items[String(index)];
    moves.push({ previous: host.path + '/' + index });
    if (!item) continue;
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
    delete items[String(index)];
  }
  if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves, prefixCount);
  context.latentDescendantKeys = undefined;
  context.enteredLatentKeys = undefined;

  host.itemCount = plan.slots.length;
  host.raw = undefined;
  host.undeclaredValues = extras.length ? extras : undefined;
  host.structure = items;
  host.children = captureFieldNodeChange(host, 'children', children);
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
