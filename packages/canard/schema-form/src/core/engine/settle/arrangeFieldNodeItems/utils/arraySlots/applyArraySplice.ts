import { isArray } from '@winglet/common-utils/filter';

import { visitFieldNodes } from '../../../../navigation';
import {
  captureFieldNodeChange,
  updateFieldNodeNameAndPath,
} from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import type {
  ArraySpliceProof,
  SettlementContext,
} from '../../../types/settlement';
import { createChildNode } from '../../../utils/compute/createChildNode';
import { captureDetachedFieldNodeReads } from '../../../utils/detached/captureDetachedFieldNodeReads';
import { markWrite } from '../../../utils/input/markWrite';
import { indexEnteredLiteralStarKey } from '../../../utils/literalStarStore/indexEnteredLiteralStarKey';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';
import { setLoadValue } from '../../../utils/loadValues/setLoadValue';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import type { ArrayPathMove } from '../../types/pathMoves';
import { rekeyArrayRuntimePaths } from '../rekey/rekeyArrayRuntimePaths';

/**
 * Apply an admitted middle remove or insert by cutting at the edited position and splicing only the tail.
 * Positions before `proof.index` keep their nodes, keys, raw, load-snapshot slots and structure entries, and are never read.
 * Mutates `host.structure` in place; the tail items shift by one position and are renamed in the general path's order.
 * Admission proved the blueprint ungated, so no gate is removed or registered here.
 * Renamed tail descendants are re-published and marked changed but not scheduled for recalculation: no value or selection of a static blueprint reads a position.
 * @param host - Live static branch array admitted by prepareArraySplice
 * @param proof - Admitted splice: the edited position, and for an insert its entry and value slot
 * @param context - Settlement receiving the general path's lifecycle and path-change facts; only the host and an inserted item are dirty
 * @returns Committed value of the removed position; undefined for an insert
 */
export const applyArraySplice = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  proof: ArraySpliceProof<Self>,
  context: SettlementContext<Self>,
): unknown => {
  const { count, index, entry } = proof;
  const length = entry ? count + 1 : count - 1;
  const items: Record<string, Self> = host.structure ?? Object.create(null);
  const previous = host.children ?? [];
  const removedItem = entry ? undefined : items[String(index)];
  const removed = removedItem?.local;
  const slot = proof.plan.slots[0];
  const value = slot && 'value' in slot ? slot.value : undefined;
  const inserted = entry ? createChildNode(host, entry) : undefined;
  const snapshot = getLoadValue(host.runtime.loadSnapshot, host.path);
  const oldSnapshot = isArray(snapshot) ? snapshot : [];
  const nextSnapshot: unknown[] = new Array(length);
  for (let position = 0; position < index; position++)
    nextSnapshot[position] = oldSnapshot[position];
  const children = previous.slice(0, index);
  const moves: ArrayPathMove[] = [];
  if (inserted) {
    nextSnapshot[index] = value;
    children.push(inserted);
    for (let position = index; position < count; position++) {
      nextSnapshot[position + 1] = oldSnapshot[position];
      children.push(previous[position]);
      moves.push({
        previous: host.path + '/' + position,
        current: host.path + '/' + (position + 1),
      });
    }
    for (let position = count; position > index; position--)
      items[String(position)] = items[String(position - 1)];
    items[String(index)] = inserted;
  } else {
    moves.push({ previous: host.path + '/' + index });
    for (let position = index + 1; position < count; position++) {
      nextSnapshot[position - 1] = oldSnapshot[position];
      children.push(previous[position]);
      moves.push({
        previous: host.path + '/' + position,
        current: host.path + '/' + (position - 1),
      });
      items[String(position - 1)] = items[String(position)];
    }
    delete items[String(count - 1)];
  }

  if (removedItem) {
    context.perished.add(removedItem);
    visitFieldNodes(
      removedItem,
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
    prunePerishedPaths(host.runtime, new Set([removedItem.path]));
  }
  rekeyArrayRuntimePaths(host.runtime, host.path, moves, index);
  context.literalStarDescendantKeys = undefined;
  context.enteredLiteralStarKeys = undefined;

  for (
    let position = inserted ? index + 1 : index;
    position < length;
    position++
  ) {
    const item = items[String(position)];
    const name = String(position);
    visitFieldNodes(
      item,
      (descendant) => {
        const former = descendant.path;
        updateFieldNodeNameAndPath(
          descendant,
          descendant === item ? name : descendant.name,
          descendant === item ? host : descendant.parent,
        );
        context.pathChanges.push({
          node: descendant,
          previous: former,
          current: descendant.path,
        });
        // Not marked dirty: the static admission leaves no gate or expression that could read a position.
        context.changedNodes.add(descendant);
      },
      { owned: true },
    );
  }
  host.itemCount = length;
  host.raw = undefined;
  host.undeclaredValues = undefined;
  host.structure = items;
  host.children = captureFieldNodeChange(host, 'children', children);
  context.arrayCounts.set(host, count);
  context.changedRaw.add(host.path);
  context.changedNodes.add(host);
  context.dirtyPaths.add(host.path);
  context.shapeDirtyPaths.add(host.path);
  if (inserted) {
    context.entered.add(inserted);
    indexEnteredLiteralStarKey(context, inserted);
    markWrite(inserted, value, context);
  }
  host.runtime.loadSnapshot = setLoadValue(
    host.runtime.loadSnapshot,
    host.path,
    nextSnapshot,
  );
  return removed;
};
