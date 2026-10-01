import { isArray } from '@winglet/common-utils/filter';

import type { ArrayArrangePlan, ArrayOperation, SchemaNodeRecord } from '../../../record';
import { SetValueOption } from '../../../types/value';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { readRawTree } from '../latent/readRawTree';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { getSettlementScratch } from '../write/getSettlementScratch';
import { registerRecalculation } from '../write/registerRecalculation';
import { releaseSettlementScratch } from '../write/releaseSettlementScratch';
import { writeSchemaNode } from '../write/writeSchemaNode';
import { applyArraySlots } from './applyArraySlots';

/** Synchronous result of a plan whose slot source has already been captured. */
const resultOf = <Self extends SchemaNodeRecord<Self>>(
  node: Self, plan: Exclude<ArrayArrangePlan, { kind: 'noop' }>,
  removed: unknown,
): unknown => {
  if (plan.kind === 'update') return undefined;
  if (plan.result.source === 'removed') return removed;
  if (plan.result.source === 'length')
    return plan.kind === 'slots' ? node.itemCount :
      isArray(node.raw) ? node.raw.length : 0;
  if (plan.result.source === 'updated')
    return isArray(node.local) ? node.local[plan.result.index] : undefined;
  return undefined;
};

/**
 * Apply an array behavior's pure proposal and commit one synchronous write.
 * @param node - Array host, or any node whose behavior rejects this verb
 * @param operation - The requested public structural operation
 * @returns Length, removed or updated value, or void as declared by the plan
 */
export const arrangeSchemaNodeItems = <Self extends SchemaNodeRecord<Self>>(
  node: Self, operation: ArrayOperation,
): unknown => {
  const plan = node.behavior.arrange(node, operation);
  if (plan.kind === 'noop')
    return operation.kind === 'push' ? node.behavior.strategy === 'branch'
      ? node.itemCount : isArray(node.raw) ? node.raw.length : 0 : undefined;
  if (plan.kind === 'raw') {
    const previous = isArray(node.raw) && plan.result.source === 'removed'
      ? node.raw[plan.result.index] : undefined;
    writeSchemaNode(node, plan.raw, 'callerReplace', SetValueOption.Overwrite);
    return resultOf(node, plan, previous);
  }
  if (node.detached || plan.kind === 'update' &&
    !node.structure?.[String(plan.index)]) {
    const scratch = getSettlementScratch(node.rootNode.runtime);
    const context = createSettlementContext(node, 'callerReplace',
      SetValueOption.Overwrite, scratch);
    let oldRaw: unknown;
    try { oldRaw = readRawTree(node, context); }
    finally { releaseSettlementScratch(scratch); }
    const source = isArray(oldRaw) ? oldRaw : [];
    const copy = source.slice();
    if (plan.kind === 'update') copy[plan.index] = plan.value;
    else {
      copy.length = 0;
      for (const slot of plan.slots)
        copy.push('from' in slot ? source[slot.from] : slot.value);
    }
    const removed = plan.kind === 'slots' && plan.result.source === 'removed'
      ? node.structure?.[String(plan.result.index)]?.local ??
        source[plan.result.index] : undefined;
    writeSchemaNode(node, copy, 'callerReplace', SetValueOption.Overwrite);
    if (plan.kind === 'update') {
      if (node.detached) return copy[plan.index];
      const item = node.structure?.[String(plan.index)];
      if (item) return item.local;
      const readScratch = getSettlementScratch(node.rootNode.runtime);
      try {
        const readContext = createSettlementContext(node, 'callerReplace',
          SetValueOption.Overwrite, readScratch);
        const current = readRawTree(node, readContext);
        return isArray(current) ? current[plan.index] : undefined;
      } finally { releaseSettlementScratch(readScratch); }
    }
    return node.detached ? plan.result.source === 'length' ? copy.length :
      removed : resultOf(node, plan, removed);
  }
  if (plan.kind === 'update') {
    const item = node.structure?.[String(plan.index)];
    if (!item) return undefined;
    writeSchemaNode(item, plan.value, 'callerReplace', SetValueOption.Overwrite);
    return item.local;
  }

  const scratch = getSettlementScratch(node.rootNode.runtime);
  const context = createSettlementContext(node, 'callerReplace',
    SetValueOption.Overwrite, scratch);
  try {
    if (context.hasGates) getGateRegistry(context.root.runtime).register(context.root);
    const removed = applyArraySlots(node, plan, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    finishSettlement(context, scratch);
    return resultOf(node, plan, removed);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
