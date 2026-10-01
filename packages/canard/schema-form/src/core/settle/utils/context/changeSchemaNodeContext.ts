import type { SchemaNodeRecord } from '../../../record';
import { SetValueOption } from '../../../types/value';
import { sameValue } from '../compute/sameValue';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { getSettlementScratch } from '../write/getSettlementScratch';
import { releaseSettlementScratch } from '../write/releaseSettlementScratch';
import { getContextOwners } from './getContextOwners';

/**
 * Settle a changed binding context from the previous committed edge baseline.
 * @param root - Live tree root that owns the context slot
 * @param contextValue - Already merged Form and provider context
 * @returns Nothing; equal values preserve the slot and skip settlement
 */
export const changeSchemaNodeContext = <Self extends SchemaNodeRecord<Self>>(
  root: Self, contextValue: Readonly<Record<string, unknown>>,
): void => {
  if (sameValue(root.runtime.context, contextValue)) return;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, 'automatic',
    SetValueOption.Overwrite, scratch);
  context.entryApi = 'setContext';
  context.contextOwners = getContextOwners(root.runtime.blueprint);
  root.runtime.context = contextValue;
  context.changedNodes.add(root);
  try {
    if (context.hasGates) getGateRegistry(root.runtime).register(root);
    for (const owner of context.contextOwners) {
      context.dirtyPaths.add(owner);
      context.dependencyOwnerPaths.add(owner);
      context.shapeDirtyPaths.add(owner.slice(0, owner.lastIndexOf('/')));
      let ancestor = owner;
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
        context.dirtyPaths.add(ancestor);
      }
    }
    computeNode(root, context);
    finishSettlement(context, scratch);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
