import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { WriteOption } from '../../../types/value';
import { sameValue } from '../../../utils/compute/sameValue';
import { computeNode } from '../compute/computeNode';
import { getContextOwners } from '../dependencies/getContextOwners';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getSettlementScratch } from '../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { expandTemplatePaths } from '../templatePaths/expandTemplatePaths';

/**
 * Settle a changed binding context from the previous committed edge baseline.
 * @param root - Live tree root that owns the context slot
 * @param contextValue - Already merged Form and provider context
 * @returns Nothing; equal values preserve the slot and skip settlement
 */
export const changeFieldNodeContext = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  contextValue: Readonly<Record<string, unknown>>,
): void => {
  if (sameValue(root.runtime.context, contextValue)) return;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(
    root,
    'automatic',
    WriteOption.Overwrite,
    scratch,
  );
  context.entryApi = 'setContext';
  const owners = getContextOwners(root.runtime.blueprint);
  context.contextOwners = owners.some((owner) => owner.includes('/*'))
    ? owners.flatMap((owner) => expandTemplatePaths(root, owner))
    : owners;
  root.runtime.context = contextValue;
  context.changedNodes.add(root);
  try {
    if (context.hasGates) getGateRegistry(root.runtime).register(root);
    for (const owner of context.contextOwners) {
      context.dirtyPaths.add(owner);
      context.dependencyOwnerPaths.add(owner);
      context.shapeDirtyPaths.add(
        owner.slice(0, owner.lastIndexOf($.Separator)),
      );
      let ancestor = owner;
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
        context.dirtyPaths.add(ancestor);
      }
    }
    computeNode(root, context);
    finishSettlement(context, scratch);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
