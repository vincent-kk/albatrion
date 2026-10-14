import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import type { FieldNodeRecord } from '../types/record';

/**
 * Release only the baseline slots used by the completed commit.
 * @param node - Record whose facts have been compared or discarded on exit
 * @returns Nothing; revision and already-built wave payloads remain untouched
 */
export const clearFieldNodeChanges = <Self>(
  node: FieldNodeRecord<Self>,
): void => {
  const changes = node.deliveryChanges;
  if (changes & FieldNodeEventType.UpdateValue) {
    node.deliveryPreviousLocal = undefined;
    node.deliveryPreviousEmit = undefined;
  }
  if (changes & FieldNodeEventType.UpdatePath)
    node.deliveryPreviousPath = undefined;
  if (changes & FieldNodeEventType.UpdateChildren)
    node.deliveryPreviousChildren = undefined;
  if (changes & FieldNodeEventType.UpdateControlledProperties)
    node.deliveryPreviousComputed = undefined;
  if (changes & FieldNodeEventType.UpdateJsonSchema)
    node.deliveryPreviousSchema = undefined;
  if (changes & FieldNodeEventType.UpdateState)
    node.deliveryPreviousState = undefined;
  node.deliveryChanges = 0;
};
