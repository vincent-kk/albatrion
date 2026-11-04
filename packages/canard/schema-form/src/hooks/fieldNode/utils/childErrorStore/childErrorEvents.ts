import { FieldNodeEventType } from '@/schema-form/core';

/** Parent and child events invalidating the aggregate error view. */
export const CHILD_ERROR_EVENTS =
  FieldNodeEventType.UpdateChildren |
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdatePath |
  FieldNodeEventType.UpdateError;
