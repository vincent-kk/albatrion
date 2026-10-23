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
import { clearArrayRuntimePaths } from '../rekey/clearArrayRuntimePaths';
import { rekeyArrayRuntimePaths } from '../rekey/rekeyArrayRuntimePaths';

/**
 * Read one position of the host's load value, as the last step of the item's load-path walk does.
 * @param hostValue - The host's load value, read once per application
 * @param key - Canonical position name, its own unescaped path segment
 * @returns The retained source at that position, or undefined beneath a non-object
 */
const readPositionLoadValue = (hostValue: unknown, key: string): unknown =>
  hostValue !== null && typeof hostValue === 'object'
    ? Reflect.get(hostValue, key)
    : undefined;

/**
 * Apply a proven prefix-preserving proposal without composing retained raw trees.
 * Mutates `host.structure` in place, reusing prefix entries and adding or deleting only tail keys.
 * A perished item's detached defaultValue is filled from the host's load value by position (NODE-044 reads unchanged).
 * An empty result (clear, or a pop of the only item) removes the host's path-store entries by host prefix instead of per-position re-keying.
 * @param host - Live branch array with no whole raw override
 * @param plan - Proposal accepted by canApplyArrayTail, prepareArrayAppend or prepareArrayPop; appended slots carry values and retained prefix slots are never read
 * @param context - Settlement receiving the same lifecycle and dirty facts as a full plan
 * @param offset - Position of `plan.slots[0]`; an append proof's plan lists only the new slot after its retained prefix, and a pop proof's plan lists no slot after its N-1 retained positions
 * @returns Committed removed-slot value, or its retained source when no item is live
 */
export const applyArrayTail = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
  context: SettlementContext<Self>,
  offset: number = 0,
): unknown => {
  const oldCount = host.itemCount;
  const length = offset + plan.slots.length;
  const prefixCount = Math.min(oldCount, length);
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
  const nextSnapshot: unknown[] = new Array(prefixCount);
  for (let index = 0; index < prefixCount; index++)
    nextSnapshot[index] = oldSnapshot[index];
  const extras: unknown[] = [];
  if (!host.blueprintNode.item)
    for (let index = templateCount; index < prefixCount; index++)
      extras.push(oldExtras[index - templateCount]);
  const created: { node: Self; value: unknown }[] = [];
  for (let index = prefixCount; index < length; index++) {
    const slot = plan.slots[index - offset];
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
    const key = String(index);
    const item = items[key];
    if (length) moves.push({ previous: host.path + '/' + index });
    if (!item) continue;
    context.perished.add(item);
    // Equals the item's load-path walk: its path is the host's plus this position,
    // and the load snapshot is not replaced before the end of this application.
    const load =
      !item.detached && item.path === host.path + '/' + key
        ? { value: readPositionLoadValue(snapshot, key) }
        : undefined;
    visitFieldNodes(
      item,
      (departing) => {
        if (!departing.runtime.detachedReads?.has(departing))
          captureDetachedFieldNodeReads(
            departing,
            {
              emit: context.previousEmit,
              context: context.previousContext,
              schema: departing.schema.schema,
            },
            departing === item ? load : undefined,
          );
      },
      { owned: true },
    );
    (perishedPaths ??= new Set()).add(item.path);
    delete items[String(index)];
  }
  if (!length)
    clearArrayRuntimePaths(
      host.runtime,
      host.path,
      oldCount,
      perishedPaths ?? new Set(),
    );
  else {
    if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
    rekeyArrayRuntimePaths(host.runtime, host.path, moves, prefixCount);
  }
  context.latentDescendantKeys = undefined;
  context.enteredLatentKeys = undefined;

  host.itemCount = length;
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
