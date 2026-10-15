import { isArray } from '@winglet/common-utils/filter';

import type {
  ArrayArrangePlan,
  ArrayOperation,
  FieldNodeRecord,
} from '../../record';
import { WriteOption } from '../../types/value';
import { computeNode } from '../utils/compute/computeNode';
import { registerRecalculation } from '../utils/dependencies/registerRecalculation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { readRawTree } from '../utils/latent/readRawTree';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { finishSettlement } from '../utils/settlement/finishSettlement';
import { readArrayLength } from '../utils/structure/readArrayLength';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { applyArraySlots } from './utils/arraySlots/applyArraySlots';
import { applyArrayTail } from './utils/arraySlots/applyArrayTail';
import { prepareArrayAppend } from './utils/arraySlots/prepareArrayAppend';
import { prepareArrayPop } from './utils/arraySlots/prepareArrayPop';

/** Synchronous result of a plan whose slot source has already been captured. */
const resultOf = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  plan: Exclude<ArrayArrangePlan, { kind: 'noop' }>,
  removed: unknown,
): unknown => {
  if (plan.kind === 'update') return undefined;
  if (plan.result.source === 'removed') return removed;
  if (plan.result.source === 'length')
    return plan.kind === 'slots'
      ? node.itemCount
      : isArray(node.raw)
        ? node.raw.length
        : 0;
  if (plan.result.source === 'updated')
    return isArray(node.local) ? node.local[plan.result.index] : undefined;
  return undefined;
};

/**
 * Apply an array behavior's pure proposal and commit one synchronous write.
 * An admitted static push, or an insert at the current length, skips the row's slot plan and the prefix proofs; see prepareArrayAppend.
 * An admitted static pop, or a remove of the last position, does the same for the truncation; see prepareArrayPop.
 * @param node - Array host, or any node whose behavior rejects this verb
 * @param operation - The requested public structural operation
 * @returns Length, removed or updated value, or void as declared by the plan
 */
export const arrangeFieldNodeItems = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): unknown => {
  const append = prepareArrayAppend(node, operation);
  const pop = append ? undefined : prepareArrayPop(node, operation);
  const plan = append
    ? append.plan
    : pop
      ? pop.plan
      : node.behavior.arrange(node, operation);
  if (plan.kind === 'noop')
    return operation.kind === 'push' || operation.kind === 'insert'
      ? readArrayLength(node)
      : undefined;
  if (plan.kind === 'raw') {
    const previous =
      isArray(node.raw) && plan.result.source === 'removed'
        ? node.raw[plan.result.index]
        : undefined;
    writeFieldNode(node, plan.raw, 'callerReplace', WriteOption.Overwrite);
    return resultOf(node, plan, previous);
  }
  if (
    node.detached ||
    (plan.kind === 'update' && !node.structure?.[String(plan.index)])
  ) {
    const scratch = getSettlementScratch(node.rootNode.runtime);
    const context = createSettlementContext(
      node,
      'callerReplace',
      WriteOption.Overwrite,
      scratch,
    );
    let oldRaw: unknown;
    try {
      oldRaw = readRawTree(node, context);
    } finally {
      releaseSettlementScratch(scratch);
    }
    const source = isArray(oldRaw) ? oldRaw : [];
    const copy = source.slice();
    if (plan.kind === 'update') copy[plan.index] = plan.value;
    else {
      copy.length = 0;
      for (const slot of plan.slots)
        copy.push('from' in slot ? source[slot.from] : slot.value);
    }
    const removed =
      plan.kind === 'slots' && plan.result.source === 'removed'
        ? (node.structure?.[String(plan.result.index)]?.local ??
          source[plan.result.index])
        : undefined;
    writeFieldNode(node, copy, 'callerReplace', WriteOption.Overwrite);
    if (plan.kind === 'update') {
      if (node.detached) return copy[plan.index];
      const item = node.structure?.[String(plan.index)];
      if (item) return item.local;
      const readScratch = getSettlementScratch(node.rootNode.runtime);
      try {
        const readContext = createSettlementContext(
          node,
          'callerReplace',
          WriteOption.Overwrite,
          readScratch,
        );
        const current = readRawTree(node, readContext);
        return isArray(current) ? current[plan.index] : undefined;
      } finally {
        releaseSettlementScratch(readScratch);
      }
    }
    return node.detached
      ? plan.result.source === 'length'
        ? copy.length
        : removed
      : resultOf(node, plan, removed);
  }
  if (plan.kind === 'update') {
    const item = node.structure?.[String(plan.index)];
    if (!item) return undefined;
    writeFieldNode(item, plan.value, 'callerReplace', WriteOption.Overwrite);
    return item.local;
  }

  const scratch = getSettlementScratch(node.rootNode.runtime);
  const context = createSettlementContext(
    node,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  try {
    if (context.hasGates)
      getGateRegistry(context.root.runtime).register(context.root);
    let removed: unknown;
    if (append) {
      context.arrayAppend = append;
      removed = applyArrayTail(node, append.plan, context, append.count);
      append.children = node.children;
      append.snapshot = node.runtime.loadSnapshot;
    } else if (pop) {
      context.arrayPop = pop;
      removed = applyArrayTail(node, pop.plan, context, pop.count - 1);
      pop.children = node.children;
      pop.snapshot = node.runtime.loadSnapshot;
    } else removed = applyArraySlots(node, plan, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    finishSettlement(context, scratch);
    return resultOf(node, plan, removed);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
