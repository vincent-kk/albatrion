import { accumulateGlobalStateDeltas, publishGlobalStateDeltas } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

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
  const deltas = new Map<string, number>();
  const exited = [...context.exited,
    ...[...context.perished].filter((node) => node.detached)];
  const seen = new Set<Self>();
  while (exited.length) {
    const node = exited.pop();
    if (!node || seen.has(node)) continue;
    seen.add(node);
    if (!context.entered.has(node) || runtime.deliverySnapshots?.has(node)) {
      const previous = runtime.deliverySnapshots?.get(node)?.interactionState ??
        node.interactionState;
      accumulateGlobalStateDeltas(deltas, previous, {});
    }
    for (const child of node.children ?? []) exited.push(child);
  }
  for (const node of context.entered)
    if (!node.detached)
      accumulateGlobalStateDeltas(deltas,
        runtime.deliverySnapshots?.get(node)?.interactionState ?? {},
        node.interactionState);
  const candidates = new Set<Self>([...context.changedNodes, ...context.stateDirtyNodes]);
  if (context.kind === 'load' && context.loadScope && !context.loadScope.detached) {
    const pending = [context.loadScope];
    while (pending.length) {
      const node = pending.pop();
      if (!node || node.detached) continue;
      candidates.add(node);
      for (const child of node.children ?? []) pending.push(child);
    }
  }
  for (const node of candidates) {
    if (node.detached || context.entered.has(node)) continue;
    const previous = runtime.deliverySnapshots?.get(node)?.interactionState ??
      node.interactionState;
    accumulateGlobalStateDeltas(deltas, previous, node.interactionState);
  }
  publishGlobalStateDeltas(context.root, deltas);
};
