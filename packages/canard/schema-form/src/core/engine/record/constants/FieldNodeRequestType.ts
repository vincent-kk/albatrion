import { FieldNodeEventType } from './FieldNodeEventType';

/** One requested input or renderer action per call. */
export enum FieldNodeRequestType {
  /** Ask the input to gain focus. */
  Focus = FieldNodeEventType.RequestFocus,
  /** Ask the input to select its value. */
  Select = FieldNodeEventType.RequestSelect,
  /** Ask the input to refresh its committed value. */
  Refresh = FieldNodeEventType.RequestRefresh,
  /** Ask the renderer to remount this subtree. */
  Remount = FieldNodeEventType.RequestRemount,
}
