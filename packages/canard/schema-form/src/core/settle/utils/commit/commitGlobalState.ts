import { accumulateGlobalStateDeltas, publishGlobalStateDeltas } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Apply final exits, perished subtrees, entries, and interaction resets together.
 * @param context - Final shape facts; revived perished candidates remain live
 * @returns Nothing; publishes only truth-count boundary changes
 * @remarks O(departing subtree size + entered/changed nodes), no whole-tree scan.
 */
export const commitGlobalState = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  const snapshots = runtime.deliverySnapshots;
  const hadGlobalState = runtime.globalStateCounts.size > 0;
  const deltas = new Map<string, number>();
  const exited: Self[] = [];
  for (const node of context.exited) exited.push(node);
  for (const node of context.perished) if (node.detached) exited.push(node);
  const seen = new Set<Self>();
  while (exited.length) {
    const node = exited.pop();
    if (!node || seen.has(node)) continue;
    seen.add(node);
    const snapshot = snapshots?.get(node);
    if (!context.entered.has(node) || snapshot) {
      const previous = snapshot?.interactionState ?? node.interactionState;
      accumulateGlobalStateDeltas(deltas, previous, {});
    }
    for (const child of node.children ?? []) exited.push(child);
  }
  for (const node of context.entered)
    if (!node.detached)
      accumulateGlobalStateDeltas(deltas,
        snapshots?.get(node)?.interactionState ?? {},
        node.interactionState);
  const accumulate = (node: Self): void => {
    if (node.detached || context.entered.has(node)) return;
    if (!hadGlobalState) {
      for (const key in node.interactionState)
        if (hasOwnProperty(node.interactionState, key) && node.interactionState[key])
          deltas.set(key, (deltas.get(key) ?? 0) + 1);
      return;
    }
    const previous = snapshots?.get(node)?.interactionState ?? node.interactionState;
    if (previous !== node.interactionState)
      accumulateGlobalStateDeltas(deltas, previous, node.interactionState);
  };
  for (const node of context.changedNodes) accumulate(node);
  for (const node of context.stateDirtyNodes)
    if (!context.changedNodes.has(node)) accumulate(node);
  if (context.kind === 'load' && context.loadScope && !context.loadScope.detached) {
    const pending = [context.loadScope];
    const visited = new Set<Self>();
    while (pending.length) {
      const node = pending.pop();
      if (!node || node.detached) continue;
      if (!visited.has(node) && !context.changedNodes.has(node) &&
        !context.stateDirtyNodes.has(node)) accumulate(node);
      visited.add(node);
      for (const child of node.children ?? []) pending.push(child);
    }
  }
  publishGlobalStateDeltas(context.root, deltas);
};
