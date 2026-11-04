import { map as mapArray } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import { getItemEntries } from '../../../blueprint';
import type { ArrayOperation, FieldNodeRecord } from '../../../record';
import { interpretFieldNodeInput, readArrayLength } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { readBatchValue } from './readBatchValue';

/**
 * Apply the pure row plan to prior batch marks without settling shape or defaults.
 * @param node - Host whose row also owns non-array rejection
 * @param operation - Verb evaluated synchronously at this call site
 * @returns Length, removed or updated input interpreted by the live or sole candidate, or undefined; unselected multi-candidate inputs stay unchanged
 * @throws The row's non-array error, propagated as the batch callback's exception
 * @remarks Copies O(array length) slots plus the existing batch overlay cost.
 */
export const markBatchArrayOperation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): unknown => {
  const value = readBatchValue(node);
  const previousItems = isArray(value) ? value : [];
  const view: FieldNodeRecord<Self> = Object.create(node, {
    source: { value },
    itemCount: { value: previousItems.length },
  });
  const plan = node.behavior.arrange(view, operation);
  if (plan.kind === 'noop')
    return operation.kind === 'push' || operation.kind === 'insert'
      ? readArrayLength(view)
      : undefined;
  let source: readonly unknown[];
  if (plan.kind === 'update') {
    const copy = previousItems.slice();
    copy[plan.index] = plan.value;
    source = copy;
  } else
    source =
      plan.kind === 'source'
        ? plan.source
        : mapArray(plan.slots, (slot) =>
            'from' in slot ? previousItems[slot.from] : slot.value,
          );
  (node.rootNode.runtime.batchWrites ??= []).push({
    node,
    value: source,
    option: WriteOption.Replace,
  });
  if (plan.kind === 'update' || plan.result.source === 'updated') {
    const index =
      plan.kind === 'update'
        ? plan.index
        : plan.result.source === 'updated'
          ? plan.result.index
          : -1;
    const live = node.structure?.[String(index)];
    const candidates = getItemEntries(node.blueprintNode, index);
    const template =
      live?.blueprintNode ??
      (candidates.length === 1 ? candidates[0].node : undefined);
    return template
      ? interpretFieldNodeInput(template, source[index], live)
      : source[index];
  }
  if (plan.result.source === 'removed') {
    const index = plan.result.index;
    const live = node.structure?.[String(index)];
    const candidates = getItemEntries(node.blueprintNode, index);
    const template =
      live?.blueprintNode ??
      (candidates.length === 1 ? candidates[0].node : undefined);
    return template
      ? interpretFieldNodeInput(template, previousItems[index], live)
      : previousItems[index];
  }
  return plan.result.source === 'length' ? source.length : undefined;
};
