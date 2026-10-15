import { isArray } from '@winglet/common-utils/filter';

import { getItemEntry } from '../../../blueprint';
import type { ArrayOperation, FieldNodeRecord } from '../../../record';
import { interpretFieldNodeInput, readArrayLength } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { readBatchValue } from './readBatchValue';

/**
 * Apply the pure row plan to prior batch marks without settling shape or defaults.
 * @param node - Host whose row also owns non-array rejection
 * @param operation - Verb evaluated synchronously at this call site
 * @returns Length, removed marked raw, updated interpreted input, or undefined
 * @throws The row's non-array error, propagated as the batch callback's exception
 * @remarks Copies O(array length) slots plus the existing batch overlay cost.
 */
export const markBatchArrayOperation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): unknown => {
  const value = readBatchValue(node);
  const source = isArray(value) ? value : [];
  const view: FieldNodeRecord<Self> = Object.create(node, {
    raw: { value },
    itemCount: { value: source.length },
  });
  const plan = node.behavior.arrange(view, operation);
  if (plan.kind === 'noop')
    return operation.kind === 'push' || operation.kind === 'insert'
      ? readArrayLength(view)
      : undefined;
  let raw: readonly unknown[];
  if (plan.kind === 'update') {
    const copy = source.slice();
    copy[plan.index] = plan.value;
    raw = copy;
  } else
    raw =
      plan.kind === 'raw'
        ? plan.raw
        : plan.slots.map((slot) =>
            'from' in slot ? source[slot.from] : slot.value,
          );
  (node.rootNode.runtime.batchWrites ??= []).push({
    node,
    value: raw,
    option: WriteOption.Replace,
  });
  if (plan.kind === 'update' || plan.result.source === 'updated') {
    const index =
      plan.kind === 'update'
        ? plan.index
        : plan.result.source === 'updated'
          ? plan.result.index
          : -1;
    const item = getItemEntry(node.blueprintNode, index);
    return item ? interpretFieldNodeInput(item.node, raw[index]) : raw[index];
  }
  if (plan.result.source === 'removed') {
    const index = plan.result.index;
    const item = getItemEntry(node.blueprintNode, index);
    return item
      ? interpretFieldNodeInput(item.node, source[index])
      : source[index];
  }
  return plan.result.source === 'length' ? raw.length : undefined;
};
