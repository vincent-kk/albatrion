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
    (node.__value__ === arrayAppend.value ||
      node.__value__ === arrayAppend.assembledValue);
  const arrayPop = context.arrayPop;
  const truncating =
    arrayPop !== undefined &&
    arrayPop.host === node &&
    arrayPop.isValid &&
    !recalculated &&
    node.children === arrayPop.children &&
    (node.__value__ === arrayPop.value ||
      node.__value__ === arrayPop.assembledValue);
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
  const previousValue = node.__value__;
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
  } else same = sameValue(node.__value__, assembled);
  let value = same ? node.__value__ : assembled;
  const baseline = node.__deliveryPreviousValue__;
  const revisit =
    (node.__deliveryChanges__ & FieldNodeEventType.UpdateValue) !==
      BIT_MASK_NONE &&
    value !== baseline &&
    !(isArray(baseline) && isArray(value) && baseline.length !== value.length);
  if (
    revisit &&
    (!host ||
      ((!recalculated ||
        keepsChildOutputValues(node.__deliveryPreviousValue__, recalculated)) &&
        keepsChildOutputValues(
          node.__deliveryPreviousValue__,
          node.children ?? [],
        ))) &&
    sameValue(node.__deliveryPreviousValue__, value)
  )
    value = node.__deliveryPreviousValue__;
  const projected = keepRootOutputValue(
    node,
    value,
    node.behavior.project(node, value),
  );
  let outputValue =
    node.__outputValue__ === node.__value__ && projected === value
      ? value
      : sameValue(node.__outputValue__, projected)
        ? node.__outputValue__
        : projected;
  if (
    node.__deliveryChanges__ & FieldNodeEventType.UpdateValue &&
    outputValue !== node.__deliveryPreviousOutputValue__ &&
    !(
      revisit &&
      outputValue === value &&
      node.__deliveryPreviousOutputValue__ === node.__deliveryPreviousValue__
    ) &&
    sameValue(node.__deliveryPreviousOutputValue__, outputValue)
  )
    outputValue = node.__deliveryPreviousOutputValue__;
  const changed =
    value !== node.__value__ || outputValue !== node.__outputValue__;
  node.__value__ = captureFieldNodeChange(node, '__value__', value);
  node.__outputValue__ = captureFieldNodeChange(
    node,
    '__outputValue__',
    outputValue,
  );
  if (changed) {
    context.changedNodes.add(node);
    const parent = node.__parent__;
    const index = context.virtualReferenceIndex;
    if (node.behavior.type !== 'virtual' && parent && index) {
      const names = index.get(parent.blueprintNode)?.get(node.name);
      if (names)
        for (const name of names) {
          const virtual = parent.__childrenByName__?.[name];
          if (virtual?.behavior.type === 'virtual' && !virtual.isDetached)
            updateOutput(virtual, context);
        }
    }
  }
  return changed;
};
