import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { FieldNodeEventType } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { computeNode } from '../compute/computeNode';
import { registerRecalculation } from '../dependencies/registerRecalculation';
import { restoreSlotSources } from '../slots/restoreSlotSources';
import { isLiveOccurrence } from './isLiveOccurrence';
import { restoreArrayStructure } from './restoreArrayStructure';

/**
 * Restore write-boundary source and extras before one final shape calculation.
 * @param context - Failed settlement with its captured boundary channels
 * @param explicitSource - Paths actually changed by the caller at the write boundary
 * @returns Nothing; the root carries Source B's calculated shape
 */
export const restoreSourceB = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  explicitSource: ReadonlySet<string>,
): void => {
  restoreArrayStructure(context);
  restoreSlotSources(context);
  for (const [node, state] of context.retainedSources ?? []) {
    node.source = state.source;
    node.extras = state.extras;
    if (state.distribution)
      context.distributedInputs.set(node, state.distribution);
    else context.distributedInputs.delete(node);
    context.dirtyPaths.add(node.path);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  for (const node of context.filledNodes) context.writtenInputs.delete(node);
  context.selectedDeclarationIds.clear();
  context.changedSource.clear();
  for (const path of explicitSource) context.changedSource.add(path);
  context.dirtyPaths.add($.Root);
  context.shapeDirtyPaths.add($.Root);
  registerRecalculation(context);
  computeNode(context.root, context);
  for (const node of context.changedNodes)
    if (
      node.deliveryChanges & FieldNodeEventType.UpdateValue &&
      !isLiveOccurrence(node, context)
    ) {
      node.storedValue = node.deliveryPreviousValue;
      node.storedOutputValue = node.deliveryPreviousOutputValue;
    }
};
