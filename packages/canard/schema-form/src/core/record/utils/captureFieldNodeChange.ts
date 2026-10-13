import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import type { FieldNodeRecord } from '../types/record';

/** Field decisions that contribute to one committed event kind. */
const CHANGE_BITS = {
  local: FieldNodeEventType.UpdateValue,
  emit: FieldNodeEventType.UpdateValue,
  path: FieldNodeEventType.UpdatePath,
  children: FieldNodeEventType.UpdateChildren,
  active: FieldNodeEventType.UpdateComputedProperties,
  visible: FieldNodeEventType.UpdateComputedProperties,
  readOnly: FieldNodeEventType.UpdateComputedProperties,
  disabled: FieldNodeEventType.UpdateComputedProperties,
  schema: FieldNodeEventType.UpdateJsonSchema,
  interactionState: FieldNodeEventType.UpdateState,
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
  if (node[field] === value || !node.deliveryInitialized || node.detached)
    return value;
  const bit = CHANGE_BITS[field];
  if (!(node.deliveryChanges & bit)) {
    switch (bit) {
      case FieldNodeEventType.UpdateValue:
        node.deliveryPreviousLocal = node.local;
        node.deliveryPreviousEmit = node.emit;
        break;
      case FieldNodeEventType.UpdatePath:
        node.deliveryPreviousPath = node.path;
        break;
      case FieldNodeEventType.UpdateChildren:
        node.deliveryPreviousChildren = node.children;
        break;
      case FieldNodeEventType.UpdateComputedProperties:
        node.deliveryPreviousComputed =
          +node.active |
          (+node.visible << 1) |
          (+node.readOnly << 2) |
          (+node.disabled << 3);
        break;
      case FieldNodeEventType.UpdateJsonSchema:
        node.deliveryPreviousSchema = node.schema;
        break;
      case FieldNodeEventType.UpdateState:
        node.deliveryPreviousState = node.interactionState;
    }
    node.deliveryChanges |= bit;
  }
  if (
    node.runtime.deliveryWatchIndex?.allNodes.size &&
    (bit === FieldNodeEventType.UpdateValue ||
      bit === FieldNodeEventType.UpdateState ||
      bit === FieldNodeEventType.UpdateComputedProperties)
  )
    (node.runtime.deliveryAffectedPaths ??= new Set()).add(node.path);
  return value;
};
