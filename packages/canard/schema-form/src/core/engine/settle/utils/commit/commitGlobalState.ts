import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import {
  FieldNodeEventType,
  accumulateGlobalStateDeltas,
  publishGlobalStateDeltas,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';

/**
 * Accumulate global-state deltas for the departing and load sources and expose the visitor the commit uses for the five global sources.
 * The visitor adds a node's state keys to the global counts when no state existed before, so `visit` must be called only for nodes
 * from the five global sources (`departing`, `enteredNodes`, `changedNodes`, `stateDirtyNodes`, `loadNodes`); `markCommitDeliveries` assembles the visit order and
 * never passes an additional candidate to it.
 * @param context - Final shape facts, including revived perished candidates
 * @returns Departing/load sources, the global-source visitor and the delta publication
 */
export const commitGlobalState = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
) => {
  const runtime = context.root.runtime;
  const hadGlobalState = runtime.globalStateCounts.size > 0;
  const deltas = new Map<string, number>();
  const departing = new Set<Self>();
  const pending = [...context.exitedNodes];
  for (const node of context.perishedNodes)
    if (node.isDetached) pending.push(node);
  while (pending.length) {
    const node = pending.pop();
    if (!node || departing.has(node)) continue;
    departing.add(node);
    for (const child of node.children ?? []) pending.push(child);
  }
  let loadNodes: Optional<Set<Self>>;
  if (
    context.kind === FieldNodeWriteKind.Load &&
    context.loadScope &&
    !context.loadScope.isDetached
  ) {
    const pending = [context.loadScope];
    loadNodes = new Set<Self>();
    while (pending.length) {
      const node = pending.pop();
      if (!node || node.isDetached || loadNodes.has(node)) continue;
      loadNodes.add(node);
      for (const child of node.children ?? []) pending.push(child);
    }
  }
  return {
    departing,
    loadNodes,
    visit(node: Self): void {
      const previousState =
        node.deliveryChanges & FieldNodeEventType.UpdateState
          ? (node.deliveryPreviousState ?? node.storedState)
          : node.storedState;
      if (departing.size && departing.has(node)) {
        if (!context.enteredNodes.has(node) || node.isDeliveryInitialized)
          accumulateGlobalStateDeltas(deltas, previousState, {});
        if (node.isDetached) return;
      }
      if (node.isDetached) return;
      if (context.enteredNodes.size && context.enteredNodes.has(node)) {
        accumulateGlobalStateDeltas(
          deltas,
          node.isDeliveryInitialized ? previousState : {},
          node.storedState,
        );
        return;
      }
      if (!hadGlobalState) {
        for (const key in node.storedState)
          if (hasOwnProperty(node.storedState, key) && node.storedState[key])
            deltas.set(key, (deltas.get(key) ?? 0) + 1);
        return;
      }
      const previous = previousState;
      if (previous !== node.storedState)
        accumulateGlobalStateDeltas(deltas, previous, node.storedState);
    },
    finish(): void {
      publishGlobalStateDeltas(context.root, deltas);
    },
  };
};
