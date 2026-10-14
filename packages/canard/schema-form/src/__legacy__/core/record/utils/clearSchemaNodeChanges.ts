import { SchemaNodeEventType } from '../SchemaNodeEventType';
import type { SchemaNodeRecord } from '../type';

/**
 * Release only the baseline slots used by the completed commit.
 * @param node - Record whose facts have been compared or discarded on exit
 * @returns Nothing; revision and already-built wave payloads remain untouched
 */
export const clearSchemaNodeChanges = <Self>(node: SchemaNodeRecord<Self>): void => {
  const changes = node.deliveryChanges;
  if (changes & SchemaNodeEventType.UpdateValue) {
    node.deliveryPreviousLocal = undefined;
    node.deliveryPreviousEmit = undefined;
  }
  if (changes & SchemaNodeEventType.UpdatePath) node.deliveryPreviousPath = undefined;
  if (changes & SchemaNodeEventType.UpdateChildren) node.deliveryPreviousChildren = undefined;
  if (changes & SchemaNodeEventType.UpdateComputedProperties) node.deliveryPreviousComputed = undefined;
  if (changes & SchemaNodeEventType.UpdateJsonSchema) node.deliveryPreviousSchema = undefined;
  if (changes & SchemaNodeEventType.UpdateState) node.deliveryPreviousState = undefined;
  node.deliveryChanges = 0;
};
