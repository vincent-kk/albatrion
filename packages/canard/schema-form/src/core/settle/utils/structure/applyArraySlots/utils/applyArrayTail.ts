import { isArray } from '@winglet/common-utils/filter';

import { getItemEntry } from '../../../../../blueprint';
import { captureSchemaNodeChange } from '../../../../../record';
import type { ArrayArrangePlan, SchemaNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../type';
import { walkOwnedSchemaNodes } from '../../../walkOwnedSchemaNodes';
import { createChildNode } from '../../../compute/createChildNode';
import { captureDetachedSchemaNodeReads } from '../../../detached/captureDetachedSchemaNodeReads';
import { getGateRegistry } from '../../../gates/getGateRegistry';
import { indexEnteredLatentKey } from '../../../latent/indexEnteredLatentKey';
import { readLatentSlotSource } from '../../../latent/readLatentSlotSource';
import { getLoadValue } from '../../../load/getLoadValue';
import { setLoadValue } from '../../../load/setLoadValue';
import { prunePerishedPaths } from '../../../transition/prunePerishedPaths';
import { markWrite } from '../../../write/markWrite';
import { rekeyArrayRuntimePaths } from '../../rekeyArrayRuntimePaths';
import type { ArrayPathMove } from '../../type';

/**
 * Apply a proven prefix-preserving proposal without composing retained raw trees.
 * Mutates `host.structure` in place, reusing prefix entries and adding or deleting only tail keys.
 * @param host - Live branch array with no whole raw override
 * @param plan - Proposal accepted by canApplyArrayTail; appended slots carry values
 * @param context - Settlement receiving the same lifecycle and dirty facts as a full plan
 * @returns Committed removed-slot value, or its retained source when no item is live
 */
export const applyArrayTail = <Self extends SchemaNodeRecord<Self>>(
  host: Self, plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
  context: SettlementContext<Self>,
): unknown => {
  const oldCount = host.itemCount;
  const prefixCount = Math.min(oldCount, plan.slots.length);
  const items: Record<string, Self> = host.structure ?? Object.create(null);
  const snapshot = getLoadValue(host.runtime.loadSnapshot, host.path);
  const oldSnapshot = isArray(snapshot) ? snapshot : [];
  const oldExtras = isArray(host.extras) ? host.extras : [];
  const templateCount = host.blueprintNode.prefixItems?.length ?? 0;
  const removedIndex = plan.result.source === 'removed' ? plan.result.index : -1;
  const removedItem = items[String(removedIndex)];
  const removedEntry = removedIndex < 0 ? undefined : getItemEntry(host.blueprintNode, removedIndex);
  const removed = removedIndex < 0 ? undefined : removedItem ? removedItem.local :
    removedEntry ? readLatentSlotSource(context, `${host.path}/${removedIndex}`, removedEntry.node) :
      oldExtras[removedIndex - templateCount];
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
    moves.push({ previous: `${host.path}/${index}` });
    if (!item) continue;
    context.perished.add(item);
    walkOwnedSchemaNodes(item, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit, context: context.previousContext,
          schema: departing.schema.schema,
        });
    });
    (perishedPaths ??= new Set()).add(item.path);
    delete items[String(index)];
  }
  if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves, prefixCount);
  context.latentDescendantKeys = undefined;
  context.enteredLatentKeys = undefined;

  host.itemCount = plan.slots.length;
  host.raw = undefined;
  host.extras = extras.length ? extras : undefined;
  host.structure = items;
  host.children = captureSchemaNodeChange(host, 'children', children);
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
      walkOwnedSchemaNodes(item, (node) => registry.register(node));
  host.runtime.loadSnapshot = setLoadValue(host.runtime.loadSnapshot, host.path, nextSnapshot);
  return removed;
};
