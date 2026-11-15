import { isArray } from '@winglet/common-utils/filter';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import { FieldNodeEventType, captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';
import { keepRootOutputValue } from './keepRootOutputValue';
import { keepsChildOutputValues } from './utils/keepsChildOutputValues';

/**
 * Assemble and project a node once from its current child order.
 * For the host of a still-valid append proof it passes the appended position to the row and records the first appended assembly in `arrayAppend.assembledValue`;
 * for the host of a still-valid pop proof it passes the remaining item count and records the first truncated assembly in `arrayPop.assembledValue`.
 * @param node - Live node whose row owns assembly and projection
 * @param context - Current commit's changed-node set and the optional `arrayAppend` and `arrayPop` proofs it reads
 * @param recalculated - Direct children recomputed with an unchanged host shape
 * @returns Whether either calculated value changed
 */
export const updateOutput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  recalculated?: readonly Self[],
): boolean => {
  context.pendingOutputs?.delete(node);
  const host =
    (node.behavior.type === 'array' || node.behavior.type === 'object') &&
    node.behavior.strategy === 'branch';
  const arrayAppend = context.arrayAppend;
  const appending =
    arrayAppend !== undefined &&
    arrayAppend.host === node &&
    arrayAppend.isValid &&
    !recalculated &&
    node.children === arrayAppend.children &&
    (node.storedValue === arrayAppend.value ||
      node.storedValue === arrayAppend.assembledValue);
  const arrayPop = context.arrayPop;
  const truncating =
    arrayPop !== undefined &&
    arrayPop.host === node &&
    arrayPop.isValid &&
    !recalculated &&
    node.children === arrayPop.children &&
    (node.storedValue === arrayPop.value ||
      node.storedValue === arrayPop.assembledValue);
  const hint =
    recalculated && host
      ? { isIncremental: false }
      : appending
        ? { isIncremental: false, previousItemCount: arrayAppend.count }
        : truncating
          ? { isIncremental: false, remainingItemCount: arrayPop.count - 1 }
          : undefined;
  const assembled = node.behavior.assemble(
    node,
    node.children ?? [],
    recalculated,
    hint,
  );
  if (appending && hint?.isIncremental) arrayAppend.assembledValue = assembled;
  if (truncating && hint?.isIncremental) arrayPop.assembledValue = assembled;
  const previousValue = node.storedValue;
  let same = false;
  if (hint?.isIncremental) {
    if (
      node.behavior.type === 'object' &&
      previousValue !== null &&
      typeof previousValue === 'object' &&
      assembled !== null &&
      typeof assembled === 'object' &&
      recalculated
    ) {
      same = true;
      for (const child of recalculated)
        if (
          !sameValue(
            Reflect.get(previousValue, child.name),
            Reflect.get(assembled, child.name),
          )
        ) {
          same = false;
          break;
        }
    }
  } else same = sameValue(node.storedValue, assembled);
  let value = same ? node.storedValue : assembled;
  const baseline = node.deliveryPreviousValue;
  const revisit =
    (node.deliveryChanges & FieldNodeEventType.UpdateValue) !== BIT_MASK_NONE &&
    value !== baseline &&
    !(isArray(baseline) && isArray(value) && baseline.length !== value.length);
  if (
    revisit &&
    (!host ||
      ((!recalculated ||
        keepsChildOutputValues(node.deliveryPreviousValue, recalculated)) &&
        keepsChildOutputValues(
          node.deliveryPreviousValue,
          node.children ?? [],
        ))) &&
    sameValue(node.deliveryPreviousValue, value)
  )
    value = node.deliveryPreviousValue;
  const projected = keepRootOutputValue(
    node,
    value,
    node.behavior.project(node, value),
  );
  let outputValue =
    node.storedOutputValue === node.storedValue && projected === value
      ? value
      : sameValue(node.storedOutputValue, projected)
        ? node.storedOutputValue
        : projected;
  if (
    node.deliveryChanges & FieldNodeEventType.UpdateValue &&
    outputValue !== node.deliveryPreviousOutputValue &&
    !(
      revisit &&
      outputValue === value &&
      node.deliveryPreviousOutputValue === node.deliveryPreviousValue
    ) &&
    sameValue(node.deliveryPreviousOutputValue, outputValue)
  )
    outputValue = node.deliveryPreviousOutputValue;
  const changed =
    value !== node.storedValue || outputValue !== node.storedOutputValue;
  node.storedValue = captureFieldNodeChange(node, 'storedValue', value);
  node.storedOutputValue = captureFieldNodeChange(
    node,
    'storedOutputValue',
    outputValue,
  );
  if (changed) {
    context.changedNodes.add(node);
    const parent = node.parent;
    const index = context.virtualReferenceIndex;
    if (node.behavior.type !== 'virtual' && parent && index) {
      const names = index.get(parent.blueprintNode)?.get(node.name);
      if (names)
        for (const name of names) {
          const virtual = parent.childrenByName?.[name];
          if (virtual?.behavior.type === 'virtual' && !virtual.isDetached)
            updateOutput(virtual, context);
        }
    }
  }
  return changed;
};
