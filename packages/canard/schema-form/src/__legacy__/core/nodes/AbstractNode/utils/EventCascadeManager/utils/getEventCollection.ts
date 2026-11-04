import type {
  NodeEventCollection,
  NodeEventEntity,
  NodeEventType,
} from '@/schema-form/__legacy__/core/types';

export const getEventCollection = <Type extends NodeEventType>(
  nodeEventType: Type,
  payload?: NodeEventEntity[Type][1],
  options?: NodeEventEntity[Type][2],
): NodeEventCollection => ({
  type: nodeEventType,
  payload: { [nodeEventType]: payload },
  options: { [nodeEventType]: options },
});
