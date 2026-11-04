import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../../blueprint';
import { visitFieldNodes } from '../../../../navigation';
import type {
  ArrayArrangePlan,
  Distribution,
  FieldNodeRecord,
} from '../../../../record';
import {
  captureFieldNodeChange,
  updateFieldNodeNameAndPath,
} from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { createChildNode } from '../../../utils/compute/createChildNode';
import { captureDetachedFieldNodeReads } from '../../../utils/detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../../../utils/gates/getGateRegistry';
import { arrayExtras } from '../../../utils/input/arrayExtras';
import { markWrite } from '../../../utils/input/markWrite';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';
import { setLoadValue } from '../../../utils/loadValues/setLoadValue';
import { getRetainedChildEntry } from '../../../utils/slots/getRetainedChildEntry';
import { markSlotChange } from '../../../utils/slots/markSlotChange';
import { readSourceTree } from '../../../utils/slots/readSourceTree';
import { rekeyArraySlotBindings } from '../../../utils/slots/rekeyArraySlotBindings';
import { replayMovedSource } from '../../../utils/slots/replayMovedSource';
import type { ArrayPathMove } from '../rekey/rekeyArrayRuntimePaths';
import { rekeyArrayRuntimePaths } from '../rekey/rekeyArrayRuntimePaths';
import { applyArrayTail } from './applyArrayTail';
import { canApplyArrayTail } from './canApplyArrayTail';

/**
 * Apply a branch plan before calculation while paths are free to change.
 * The host's source tree is composed only when a slot reads it: extras, a whole source, or a removed or retained slot without a live node.
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
  // With an item template and no tuple positions, extras or whole source, only a slot without a live node reads source.
  let sourceSlots =
    host.source === undefined &&
    host.blueprintNode.item &&
    !host.blueprintNode.prefixItems?.length &&
    host.extras === undefined
      ? undefined
      : readSourceSlots(host, context);
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
        : (sourceSlots ??= readSourceSlots(host, context))[removedIndex];
  const registry = getGateRegistry(host.runtime);
  if (context.hasGates)
    for (const item of host.children ?? []) registry.remove(item);
  const nextItems: Dictionary<Self> = Object.create(null);
  const nextSource: unknown[] = [];
  const nextSnapshot: unknown[] = [];
  const reused = new Set<Self>();
  const created: { node: Self; value: unknown; moved: boolean }[] = [];
  let deferred = false;
  const destinations = new Map<number, number>();
  const candidateMoves = host.blueprintNode.hasCandidateDescendants === true;
  for (let index = 0; index < plan.slots.length; index++) {
    const slot = plan.slots[index];
    const from = 'from' in slot ? slot.from : undefined;
    const value = 'value' in slot ? slot.value : sourceSlots?.[slot.from];
    nextSource.push(value);
    nextSnapshot.push('value' in slot ? slot.value : oldSnapshot[slot.from]);
    const candidates = getItemEntries(host.blueprintNode, index);
    const sourceCandidates =
      from !== undefined && candidateMoves
        ? getItemEntries(host.blueprintNode, from)
        : undefined;
    let moved = false;
    if (from !== undefined && candidateMoves) {
      moved = candidates.length > 1;
      if (!moved)
        for (const candidate of candidates)
          if (candidate.node.hasCandidateDescendants) {
            moved = true;
            break;
          }
      if (!moved && sourceCandidates) {
        moved = sourceCandidates.length > 1;
        if (!moved)
          for (const candidate of sourceCandidates)
            if (candidate.node.hasCandidateDescendants) {
              moved = true;
              break;
            }
      }
    }
    if (from !== undefined && moved) destinations.set(from, index);
    const entry = candidates[0];
    if (!entry && !moved) continue;
    const old = from === undefined ? undefined : oldItems[String(from)];
    if (old) {
      let compatible = false;
      for (const candidate of candidates)
        if (old.blueprintNode === candidate.node) {
          compatible = true;
          break;
        }
      if (compatible) {
        nextItems[String(index)] = old;
        reused.add(old);
        if (from !== undefined && !moved) destinations.set(from, index);
        continue;
      }
    }
    const source =
      from === undefined || sourceSlots
        ? value
        : (sourceSlots = readSourceSlots(host, context))[from];
    if (from !== undefined && !old && !moved) destinations.set(from, index);
    if (old && moved) {
      const binding = getRetainedChildEntry(host, old.name, old.blueprintNode);
      if (binding) {
        markSlotChange(host, binding, old, context);
        (host.inactiveSlots ??= new Map()).set(binding, old);
      }
    }
    if (!entry) continue;
    if (candidates.length > 1) {
      nextSource[index] = source;
      deferred = true;
      continue;
    }
    const node = createChildNode(host, entry);
    nextItems[String(index)] = node;
    created.push({
      node,
      value: source,
      moved,
    });
  }
  const moves: ArrayPathMove[] = [];
  for (let index = 0; index < oldCount; index++) {
    const item = oldItems[String(index)];
    const current = destinations.get(index);
    moves.push({
      previous: appendSegment(host.path, index),
      current:
        current === undefined ? undefined : appendSegment(host.path, current),
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
  }
  rekeyArraySlotBindings(host, moves, context);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves);
  if (candidateMoves)
    (context.rekeyedArrayMoves ??= new Map()).set(host, moves);
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
        if (
          descendant.inactiveSlots?.size ||
          descendant.inactiveSlotOverlays?.size ||
          descendant.inactiveSlotChildren?.size
        )
          (descendant.runtime.slotDirtyHosts ??= new Set()).add(descendant);
        context.dirtyPaths.add(descendant.path);
        if (descendant.behavior.strategy === 'branch')
          context.shapeDirtyPaths.add(descendant.path);
        context.changedNodes.add(descendant);
      },
      { owned: true },
    );
  }
  host.itemCount = plan.slots.length;
  host.source = undefined;
  host.extras = arrayExtras(host, nextSource);
  host.structure = nextItems;
  host.children = captureFieldNodeChange(
    host,
    'children',
    Object.values(nextItems),
  );
  context.arrayCounts.set(host, oldCount);
  context.changedSource.add(host.path);
  context.changedNodes.add(host);
  context.dirtyPaths.add(host.path);
  context.shapeDirtyPaths.add(host.path);
  if (deferred) {
    const distribution: Distribution = {
      input: nextSource,
      whole: false,
      automatic: false,
    };
    context.distributedInputs.set(host, {
      ...distribution,
      preserveLatent: true,
    });
  }
  for (const { node, value, moved } of created) {
    context.entered.add(node);

    if (moved) replayMovedSource(node, value, context);
    else markWrite(node, value, context);
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

/**
 * Read the host's composed source tree as slots.
 * @param host - Live array occurrence before its plan is applied
 * @param context - Settlement holding retained sources beneath the host
 * @returns Source slots, or none when the tree is not an array
 */
const readSourceSlots = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  context: SettlementContext<Self>,
): readonly unknown[] => {
  const source = readSourceTree(host, context);
  return isArray(source) ? source : [];
};
