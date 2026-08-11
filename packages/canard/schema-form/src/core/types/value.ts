import type { Fn } from '@aileron/declare';

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
  BIT_MASK_NONE,
} from '@/schema-form/app/constants';

/** Callback a node invokes to notify its parent of a value change. */
export type HandleChange<Value = any> = Fn<[value: Value, batch?: boolean]>;

/** Bit flags controlling how a value application behaves. */
export enum SetValueOption {
  None = BIT_MASK_NONE,
  /** Replace the current value */
  Replace = BIT_FLAG_00,
  /** Update the value and trigger onChange */
  EmitChange = BIT_FLAG_01,
  /** Update the value and publish UpdateValue event */
  Propagate = BIT_FLAG_02,
  /** Propagate the update to child nodes */
  Refresh = BIT_FLAG_03,
  /** Update the value with batch mode */
  Batch = BIT_FLAG_04,
  /** Ignore node tree update cycle */
  Isolate = BIT_FLAG_05,
  /** Normalize the value that is not in the schema */
  Normalize = BIT_FLAG_06,
  /** Trigger a refresh to update the FormTypeInput */
  PublishUpdateEvent = BIT_FLAG_07,
  /** Prevent the injection of the node's value */
  PreventInjection = BIT_FLAG_08,
  /** Update the value and trigger onChange with batch mode */
  BatchedEmitChange = EmitChange | Batch,
  /** Default SetValue option */
  Default = EmitChange | PublishUpdateEvent,
  /** Default SetValue option with batch mode */
  BatchDefault = Batch | Default,
  /** Reset the node to its initial value */
  Reset = Replace | Propagate | BatchDefault | PreventInjection,
  /** Reset the node to its initial value and isolate the computed properties */
  IsolateReset = Reset | Isolate,
  /** Reset the node to its initial value and trigger a refresh */
  StableReset = Reset | Refresh | Normalize,
  /** Reset the node in isolation and trigger a refresh */
  IsolateStableReset = StableReset | Isolate,
  /** Both propagate to children and trigger a refresh */
  Merge = Propagate | Refresh | Isolate | BatchDefault,
  /** Replace the value and propagate the update with refresh */
  Overwrite = Replace | Merge,
}

/** Subset of `SetValueOption` exposed to consumers of the package. */
export enum PublicSetValueOption {
  /** Both propagate to children and trigger a refresh */
  Merge = SetValueOption.Merge,
  /** Replace the value and propagate the update with refresh */
  Overwrite = SetValueOption.Overwrite,
}

/** Union of internal and public `SetValueOption` flags. */
export type UnionSetValueOption = SetValueOption | PublicSetValueOption;

/**
 * Options for resetting a node to its initial or computed value.
 * @typeParam Value - The value type of the node
 */
export interface ResetOptions<Value = unknown> {
  /** Whether to update the scoped property (for oneOf/anyOf branches) */
  updateScoped?: boolean;
  /** Whether to force composition processing while resetting */
  isolate?: boolean;
  /** Whether to prefer the latest (current) value over the initial value */
  preferLatest?: boolean;
  /** Whether to apply the derived value when preferLatest is true and derivedValue is defined */
  applyDerivedValue?: boolean;
  /** Whether to check the default value first when preferLatest is true */
  checkDefaultValueFirst?: boolean;
  /** Explicit input value with highest priority - overrides all other values */
  inputValue?: Value | null;
  /** Fallback value used in the default value calculation logic */
  fallbackValue?: Value | null;
}
