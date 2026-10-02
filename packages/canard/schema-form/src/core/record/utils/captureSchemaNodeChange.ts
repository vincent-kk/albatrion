import { SchemaNodeEventType } from '../SchemaNodeEventType';
import type { SchemaNodeRecord } from '../type';

/** Field decisions that contribute to one committed event kind. */
const CHANGE_BITS = {
  local: SchemaNodeEventType.UpdateValue,
  emit: SchemaNodeEventType.UpdateValue,
  path: SchemaNodeEventType.UpdatePath,
  children: SchemaNodeEventType.UpdateChildren,
  active: SchemaNodeEventType.UpdateComputedProperties,
  visible: SchemaNodeEventType.UpdateComputedProperties,
  readOnly: SchemaNodeEventType.UpdateComputedProperties,
  disabled: SchemaNodeEventType.UpdateComputedProperties,
  schema: SchemaNodeEventType.UpdateJsonSchema,
  interactionState: SchemaNodeEventType.UpdateState,
};

/**
 * Capture a kind's first baseline before the caller publishes a changed field.
 * @param node - Record whose calculated field is about to change
 * @param field - Field decided by compute, rekey, or settlement state writes
 * @param value - Final field value to return for assignment
 * @returns The supplied value without changing any public value itself
 */
export const captureSchemaNodeChange = <Self, Key extends keyof typeof CHANGE_BITS,
  Value extends SchemaNodeRecord<Self>[Key]>(
  node: SchemaNodeRecord<Self>, field: Key, value: Value,
): Value => {
  if (node[field] === value || !node.deliveryInitialized || node.detached) return value;
  const bit = CHANGE_BITS[field];
  if (!(node.deliveryChanges & bit)) {
    switch (bit) {
      case SchemaNodeEventType.UpdateValue:
        node.deliveryPreviousLocal = node.local;
        node.deliveryPreviousEmit = node.emit;
        break;
      case SchemaNodeEventType.UpdatePath:
        node.deliveryPreviousPath = node.path;
        break;
      case SchemaNodeEventType.UpdateChildren:
        node.deliveryPreviousChildren = node.children;
        break;
      case SchemaNodeEventType.UpdateComputedProperties:
        node.deliveryPreviousComputed = +node.active | +node.visible << 1 |
          +node.readOnly << 2 | +node.disabled << 3;
        break;
      case SchemaNodeEventType.UpdateJsonSchema:
        node.deliveryPreviousSchema = node.schema;
        break;
      case SchemaNodeEventType.UpdateState:
        node.deliveryPreviousState = node.interactionState;
    }
    node.deliveryChanges |= bit;
  }
  if (node.runtime.deliveryWatchIndex?.allNodes.size &&
    (bit === SchemaNodeEventType.UpdateValue || bit === SchemaNodeEventType.UpdateState ||
      bit === SchemaNodeEventType.UpdateComputedProperties))
    (node.runtime.deliveryAffectedPaths ??= new Set()).add(node.path);
  return value;
};
