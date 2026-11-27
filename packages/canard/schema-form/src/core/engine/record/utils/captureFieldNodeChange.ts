import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import {
  DISABLED_BIT_SHIFT,
  READ_ONLY_BIT_SHIFT,
  VISIBLE_BIT_SHIFT,
} from '../constants/controlledPropertyShift';
import type { FieldNodeRecord } from '../types/record';
import { recordFieldNodeRevealBaseline } from './recordFieldNodeRevealBaseline';

/** Field decisions that contribute to one committed event kind. */
const CHANGE_BITS = {
  __value__: FieldNodeEventType.UpdateValue,
  __outputValue__: FieldNodeEventType.UpdateValue,
  path: FieldNodeEventType.UpdatePath,
  children: FieldNodeEventType.UpdateChildren,
  isActive: FieldNodeEventType.UpdateControlledProperties,
  isVisible: FieldNodeEventType.UpdateControlledProperties,
  isReadOnly: FieldNodeEventType.UpdateControlledProperties,
  isDisabled: FieldNodeEventType.UpdateControlledProperties,
  __schema__: FieldNodeEventType.UpdateJsonSchema,
  __state__: FieldNodeEventType.UpdateState,
};

/**
 * Capture a kind's first baseline before the caller publishes a changed field.
 * @param node - Record whose calculated field is about to change
 * @param field - Field decided by compute, rekey, or settlement state writes
 * @param value - Final field value to return for assignment
 * @returns The supplied value without changing any public value itself
 */
export const captureFieldNodeChange = <
  Self,
  Key extends keyof typeof CHANGE_BITS,
  Value extends FieldNodeRecord<Self>[Key],
>(
  node: FieldNodeRecord<Self>,
  field: Key,
  value: Value,
): Value => {
  if (
    node[field] === value ||
    !node.__isDeliveryInitialized__ ||
    node.isDetached
  )
    return value;
  if (field === '__state__' || field === 'isActive' || field === 'isVisible')
    recordFieldNodeRevealBaseline(node);
  const bit = CHANGE_BITS[field];
  if (!(node.__deliveryChanges__ & bit)) {
    switch (bit) {
      case FieldNodeEventType.UpdateValue:
        node.__deliveryPreviousValue__ = node.__value__;
        node.__deliveryPreviousOutputValue__ = node.__outputValue__;
        break;
      case FieldNodeEventType.UpdatePath:
        node.__deliveryPreviousPath__ = node.path;
        break;
      case FieldNodeEventType.UpdateChildren:
        node.__deliveryPreviousChildren__ = node.children;
        break;
      case FieldNodeEventType.UpdateControlledProperties:
        node.__deliveryPreviousComputedBits__ =
          +node.isActive |
          (+node.isVisible << VISIBLE_BIT_SHIFT) |
          (+node.isReadOnly << READ_ONLY_BIT_SHIFT) |
          (+node.isDisabled << DISABLED_BIT_SHIFT);
        break;
      case FieldNodeEventType.UpdateJsonSchema:
        node.__deliveryPreviousSchema__ = node.__schema__;
        break;
      case FieldNodeEventType.UpdateState:
        node.__deliveryPreviousState__ = node.__state__;
    }
    node.__deliveryChanges__ |= bit;
  }
  if (
    node.runtime.deliveryWatchIndex?.allNodes.size &&
    (bit === FieldNodeEventType.UpdateValue ||
      bit === FieldNodeEventType.UpdateState ||
      bit === FieldNodeEventType.UpdateControlledProperties)
  )
    (node.runtime.deliveryAffectedPaths ??= new Set()).add(node.path);
  return value;
};
