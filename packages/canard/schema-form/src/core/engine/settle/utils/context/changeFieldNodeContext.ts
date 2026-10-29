import {
  JSONPointer as $,
  PointerOperator,
  hasPointerOperator,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

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
  context.contextOwners = (() => {
    const items = owners;
    for (let index = 0, count = items.length; index < count; index++) {
      if (!(index in items)) continue;
      const owner = items[index];
      if (hasPointerOperator(owner, PointerOperator.Wildcard)) return true;
    }
    return false;
  })()
    ? owners.flatMap((owner) => expandTemplatePaths(root, owner))
    : owners;
  root.runtime.context = contextValue;
  context.changedNodes.add(root);
  try {
    if (context.hasGates) getGateRegistry(root.runtime).register(root);
    for (const owner of context.contextOwners) {
      context.dirtyPaths.add(owner);
      context.dependencyOwnerPaths.add(owner);
      context.shapeDirtyPaths.add(resolvePointer(owner, $.Parent));
      let ancestor = owner;
      while (ancestor) {
        ancestor = resolvePointer(ancestor, $.Parent);
        context.dirtyPaths.add(ancestor);
      }
    }
    computeNode(root, context);
    finishSettlement(context, scratch);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
