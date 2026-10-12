import { isArray } from '@winglet/common-utils/filter';

import type { ArrayOperation, SchemaNodeRecord } from '../../../record';
import { getItemEntry } from '../../../blueprint';
import { interpretSchemaNodeInput } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { readBatchValue } from './readBatchValue';

/**
 * Apply the pure row plan to prior batch marks without settling shape or defaults.
 * @param node - Host whose row also owns non-array rejection
 * @param operation - Verb evaluated synchronously at this call site
 * @returns Length, removed marked raw, updated interpreted input, or undefined
 * @throws The row's non-array error, propagated as the batch callback's exception
 * @remarks Copies O(array length) slots plus the existing batch overlay cost.
 */
export const markBatchArrayOperation = <Self extends SchemaNodeRecord<Self>>(
  node: Self, operation: ArrayOperation,
): unknown => {
  const value = readBatchValue(node);
  const source = isArray(value) ? value : [];
  const view: SchemaNodeRecord<Self> = Object.create(node, {
    raw: { value }, itemCount: { value: source.length },
  });
  const plan = node.behavior.arrange(view, operation);
  if (plan.kind === 'noop') return undefined;
  let raw: readonly unknown[];
  if (plan.kind === 'update') {
    const copy = source.slice();
    copy[plan.index] = plan.value;
    raw = copy;
  } else raw = plan.kind === 'raw' ? plan.raw : plan.slots.map((slot) =>
    'from' in slot ? source[slot.from] : slot.value);
  (node.rootNode.runtime.batchWrites ??= []).push({
    node, value: raw, option: SetValueOption.Replace,
  });
  if (plan.kind === 'update' || plan.result.source === 'updated') {
    const index = plan.kind === 'update' ? plan.index :
      plan.result.source === 'updated' ? plan.result.index : -1;
    const item = getItemEntry(node.blueprintNode, index);
    return item ? interpretSchemaNodeInput(item.node, raw[index]) : raw[index];
  }
  if (plan.result.source === 'removed') {
    const index = plan.result.index;
    const item = getItemEntry(node.blueprintNode, index);
    return item ? interpretSchemaNodeInput(item.node, source[index]) : source[index];
  }
  return plan.result.source === 'length' ? raw.length : undefined;
};
