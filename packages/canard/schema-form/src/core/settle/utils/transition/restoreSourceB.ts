import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { computeNode } from '../compute/computeNode';
import { registerRecalculation } from '../write/registerRecalculation';
import { withdrawDetachedFills } from './withdrawDetachedFills';

/**
 * Restore write-boundary raw and extras before one final shape calculation.
 * @param context - Failed settlement with its ordered automatic-write log
 * @param explicitRaw - Paths actually changed by the caller at the write boundary
 * @returns Nothing; the root carries Source B's calculated shape
 */
export const restoreSourceB = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  explicitRaw: ReadonlySet<string>,
): void => {
  for (let index = context.automaticLog.length - 1; index >= 0; index--) {
    const entry = context.automaticLog[index];
    entry.node.raw = entry.previousRaw;
    entry.node.extras = entry.previousExtras;
    context.dirtyPaths.add(entry.node.path);
    if (entry.node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(entry.node.path);
  }
  for (const [key, previous] of context.latentAutomaticLog)
    if (previous.present) context.root.runtime.latentRaw.set(key, previous.value);
    else context.root.runtime.latentRaw.delete(key);
  withdrawDetachedFills(context);
  context.selectedDeclarationIds.clear();
  context.changedRaw.clear();
  for (const path of explicitRaw) context.changedRaw.add(path);
  context.dirtyPaths.add('');
  context.shapeDirtyPaths.add('');
  registerRecalculation(context);
  computeNode(context.root, context);
};
