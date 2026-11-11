import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
  BIT_FLAG_05,
  BIT_FLAG_06,
  BIT_FLAG_07,
  BIT_FLAG_08,
  BIT_FLAG_09,
  BIT_FLAG_10,
  BIT_FLAG_11,
  BIT_FLAG_12,
  BIT_FLAG_13,
  BIT_FLAG_14,
  BIT_FLAG_15,
  BIT_FLAG_16,
} from '@/schema-form/constants/bitmask';

/** Bit positions shared by settlement delivery and later dispatch. */
export enum FieldNodeEventType {
  /** A node completed initialization. */
  Initialized = BIT_FLAG_00,
  /** The absolute path changed. */
  UpdatePath = BIT_FLAG_01,
  /** The local or emitted value changed. */
  UpdateValue = BIT_FLAG_02,
  /** Interaction flags changed. */
  UpdateState = BIT_FLAG_03,
  /** Aggregate interaction flags changed. */
  UpdateGlobalState = BIT_FLAG_04,
  /** Validation issues changed. */
  UpdateError = BIT_FLAG_05,
  /** Aggregate validation issues changed. */
  UpdateGlobalError = BIT_FLAG_06,
  /** The direct children changed. */
  UpdateChildren = BIT_FLAG_07,
  /** Calculated state or watched values changed. */
  UpdateControlledProperties = BIT_FLAG_08,
  /** The input gained focus. */
  Focused = BIT_FLAG_09,
  /** The input lost focus. */
  Blurred = BIT_FLAG_10,
  /** Ask the input to gain focus. */
  RequestFocus = BIT_FLAG_11,
  /** Ask the input to select its value. */
  RequestSelect = BIT_FLAG_12,
  /** Ask the input to refresh its committed value. */
  RequestRefresh = BIT_FLAG_13,
  /** Ask the renderer to remount this subtree. */
  RequestRemount = BIT_FLAG_14,
  /** The effective schema reference changed. */
  UpdateJsonSchema = BIT_FLAG_15,
  /** Root settlement diagnostics changed. */
  UpdateDiagnostics = BIT_FLAG_16,
}
