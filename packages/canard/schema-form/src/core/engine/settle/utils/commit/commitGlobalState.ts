import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  FieldNodeEventType,
  accumulateGlobalStateDeltas,
  publishGlobalStateDeltas,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Accumulate global-state deltas for the departing and load sources and expose the visitor the commit uses for the five global sources.
 * The visitor adds a node's state keys to the global counts when no state existed before, so `visit` must be called only for nodes
 * from the five global sources (departing, entered, changed, stateDirty, load); `markCommitDeliveries` assembles the visit order and
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
  const pending = [...context.exited];
  for (const node of context.perished) if (node.detached) pending.push(node);
  while (pending.length) {
    const node = pending.pop();
    if (!node || departing.has(node)) continue;
    departing.add(node);
    for (const child of node.children ?? []) pending.push(child);
  }
  let loadNodes: Set<Self> | undefined;
  if (
    context.kind === 'load' &&
    context.loadScope &&
    !context.loadScope.detached
  ) {
    const pending = [context.loadScope];
    loadNodes = new Set<Self>();
    while (pending.length) {
      const node = pending.pop();
      if (!node || node.detached || loadNodes.has(node)) continue;
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
          ? (node.deliveryPreviousState ?? node.interactionState)
          : node.interactionState;
      if (departing.size && departing.has(node)) {
        if (!context.entered.has(node) || node.deliveryInitialized)
          accumulateGlobalStateDeltas(deltas, previousState, {});
        if (node.detached) return;
      }
      if (node.detached) return;
      if (context.entered.size && context.entered.has(node)) {
        accumulateGlobalStateDeltas(
          deltas,
          node.deliveryInitialized ? previousState : {},
          node.interactionState,
        );
        return;
      }
      if (!hadGlobalState) {
        for (const key in node.interactionState)
          if (
            hasOwnProperty(node.interactionState, key) &&
            node.interactionState[key]
          )
            deltas.set(key, (deltas.get(key) ?? 0) + 1);
        return;
      }
      const previous = previousState;
      if (previous !== node.interactionState)
        accumulateGlobalStateDeltas(deltas, previous, node.interactionState);
    },
    finish(): void {
      publishGlobalStateDeltas(context.root, deltas);
    },
  };
};
