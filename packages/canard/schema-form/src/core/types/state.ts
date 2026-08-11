import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_MASK_NONE,
} from '@/schema-form/app/constants';

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
export enum NodeState {
  /** Value diverged from its initial/default state. */
  Dirty = BIT_FLAG_00,
  /** Node interacted with (e.g., focused/blurred) at least once. */
  Touched = BIT_FLAG_01,
  /** UI should display validation messages for this node. */
  ShowError = BIT_FLAG_02,
}

/** Typed bag of boolean-like UI state flags carried by a node. */
export type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.ShowError]?: boolean;
  [key: string]: any;
};
