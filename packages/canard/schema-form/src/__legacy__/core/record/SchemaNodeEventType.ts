/** Bit positions shared by settlement delivery and later dispatch. */
export enum SchemaNodeEventType {
  /** A node completed initialization. */
  Initialized = 1 << 0,
  /** The absolute path changed. */
  UpdatePath = 1 << 1,
  /** The local or emitted value changed. */
  UpdateValue = 1 << 2,
  /** Interaction flags changed. */
  UpdateState = 1 << 3,
  /** Aggregate interaction flags changed. */
  UpdateGlobalState = 1 << 4,
  /** Validation issues changed. */
  UpdateError = 1 << 5,
  /** Aggregate validation issues changed. */
  UpdateGlobalError = 1 << 6,
  /** The direct children changed. */
  UpdateChildren = 1 << 7,
  /** Calculated state or watched values changed. */
  UpdateComputedProperties = 1 << 8,
  /** The input gained focus. */
  Focused = 1 << 9,
  /** The input lost focus. */
  Blurred = 1 << 10,
  /** Ask the input to gain focus. */
  RequestFocus = 1 << 11,
  /** Ask the input to select its value. */
  RequestSelect = 1 << 12,
  /** Ask the input to refresh its committed value. */
  RequestRefresh = 1 << 13,
  /** Ask the renderer to remount this subtree. */
  RequestRemount = 1 << 14,
  /** The effective schema reference changed. */
  UpdateJsonSchema = 1 << 15,
  /** Root settlement diagnostics changed. */
  UpdateDiagnostics = 1 << 16,
}
