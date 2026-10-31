import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';

/** Validation strategy applied to a node. */
export enum ValidationMode {
  /** Disable validation for this node. */
  None = BIT_MASK_NONE,
  /** Run validation on every value mutation (e.g., on input change). */
  OnChange = BIT_FLAG_00,
  /** Defer validation until explicitly requested by the caller. */
  OnRequest = BIT_FLAG_01,
}

/** UI state flags a node can carry. */
export enum FieldNodeState {
  /** Set when the user changes this node's value through its input; programmatic writes (setValue, array verbs) and automatic writes (fill, derived, injectTo, unsetValue, exit clearing, trim) never set it. Cleared by reset, controls.resetInteraction and clearState. */
  Dirty = BIT_FLAG_00,
  /** Set once the user leaves this node's input (blur) for the first time. Cleared by reset, controls.resetInteraction and clearState. */
  Touched = BIT_FLAG_01,
  /** Request validation messages for this node. Newly eligible errors wait for a pending write verdict; hiding is immediate. */
  ErrorVisible = BIT_FLAG_02,
}

/** Typed bag of boolean-like UI state flags carried by a node. */
export type NodeStateFlags = {
  [FieldNodeState.Dirty]?: boolean;
  [FieldNodeState.Touched]?: boolean;
  [FieldNodeState.ErrorVisible]?: boolean;
  [key: string]: any;
};
