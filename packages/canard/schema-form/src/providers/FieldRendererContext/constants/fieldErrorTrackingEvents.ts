import { FieldNodeEventType } from '@/schema-form/core';

/** Node deliveries that can change a formatter's result or display eligibility. */
export const FIELD_ERROR_TRACKING_EVENTS =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdateError |
  FieldNodeEventType.UpdateControlledProperties |
  FieldNodeEventType.UpdateJsonSchema |
  FieldNodeEventType.UpdatePath;
