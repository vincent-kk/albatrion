import { SchemaNodeEventType } from './SchemaNodeEventType';

/** One requested input or renderer action per call. */
export enum SchemaNodeRequestType {
  /** Ask the input to gain focus. */
  Focus = SchemaNodeEventType.RequestFocus,
  /** Ask the input to select its value. */
  Select = SchemaNodeEventType.RequestSelect,
  /** Ask the input to refresh its committed value. */
  Refresh = SchemaNodeEventType.RequestRefresh,
  /** Ask the renderer to remount this subtree. */
  Remount = SchemaNodeEventType.RequestRemount,
}
