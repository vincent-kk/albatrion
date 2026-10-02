import { SchemaNodeEventType, accumulateGlobalStateDeltas, publishGlobalStateDeltas } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Prepare ordered global-state candidates for the shared commit visitor.
 * @param context - Final shape facts, including revived perished candidates
 * @returns Candidate order, per-record delta accumulation and final publication
 */
export const commitGlobalState = <Self extends SchemaNodeRecord<Self>>(
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
  const nodes = new Set(departing);
  for (const node of context.entered) nodes.add(node);
  for (const node of context.changedNodes) nodes.add(node);
  for (const node of context.stateDirtyNodes) nodes.add(node);
  if (context.kind === 'load' && context.loadScope && !context.loadScope.detached) {
    const pending = [context.loadScope];
    const visited = new Set<Self>();
    while (pending.length) {
      const node = pending.pop();
      if (!node || node.detached || visited.has(node)) continue;
      visited.add(node);
      nodes.add(node);
      for (const child of node.children ?? []) pending.push(child);
    }
  }
  return {
    nodes,
    visit(node: Self): void {
      const previousState = (node.deliveryChanges & SchemaNodeEventType.UpdateState)
        ? node.deliveryPreviousState ?? node.interactionState : node.interactionState;
      if (departing.has(node)) {
        if (!context.entered.has(node) || node.deliveryInitialized)
          accumulateGlobalStateDeltas(deltas,
            previousState, {});
        if (node.detached) return;
      }
      if (node.detached) return;
      if (context.entered.has(node)) {
        accumulateGlobalStateDeltas(deltas,
          node.deliveryInitialized ? previousState : {}, node.interactionState);
        return;
      }
      if (!nodes.has(node)) return;
      if (!hadGlobalState) {
        for (const key in node.interactionState)
          if (hasOwnProperty(node.interactionState, key) && node.interactionState[key])
            deltas.set(key, (deltas.get(key) ?? 0) + 1);
        return;
      }
      const previous = previousState;
      if (previous !== node.interactionState)
        accumulateGlobalStateDeltas(deltas, previous, node.interactionState);
    },
    finish(): void { publishGlobalStateDeltas(context.root, deltas); },
  };
};
