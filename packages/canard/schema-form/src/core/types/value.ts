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
  BIT_FLAG_09,
  BIT_MASK_NONE,
} from '@/schema-form/app/constants';

/**
 * Callback a node invokes to notify its parent of a value change.
 * @remarks `automatic` marks a value the form produced by itself (see `SetValueOption.Automatic`); a parent that is `null` records it without becoming an object.
 */
export type HandleChange<Value = any> = Fn<
  [value: Value, batch?: boolean, automatic?: boolean]
>;

/** Bit flags controlling how a value application behaves. */
export enum SetValueOption {
  None = BIT_MASK_NONE,
  /** Replace the current value instead of merging into it — a value equal to the current one is still applied */
  Replace = BIT_FLAG_00,
  /** Report the new value to the parent through onChange */
  EmitChange = BIT_FLAG_01,
  /** Propagate the update to child nodes — read by an object branch only; an array branch always rebuilds its items */
  Propagate = BIT_FLAG_02,
  /** Publish RequestRefresh so an uncontrolled FormTypeInput re-reads the value */
  Refresh = BIT_FLAG_03,
  /** Report to the parent in batch mode — the parent defers its commit to one batched emit */
  Batch = BIT_FLAG_04,
  /** Publish UpdateValue as unsettled (deferred, re-runs computed filtering) and update computed properties at once — read by branch nodes only */
  Isolate = BIT_FLAG_05,
  /** Drop the keys the schema does not declare — read by object nodes only */
  Normalize = BIT_FLAG_06,
  /** Publish the UpdateValue event */
  PublishUpdateEvent = BIT_FLAG_07,
  /** Keep the UpdateValue event from triggering the node's `injectTo` */
  PreventInjection = BIT_FLAG_08,
  /** The form wrote this value by itself (default, reset, derived) — it never turns a `null` ancestor into an object */
  Automatic = BIT_FLAG_09,
  /** Report to the parent in batch mode without publishing UpdateValue */
  BatchedEmitChange = EmitChange | Batch,
  /** Default SetValue option */
  Default = EmitChange | PublishUpdateEvent,
  /** Default SetValue option with batch mode */
  BatchDefault = Batch | Default,
  /** Reset the node to its initial value */
  Reset = Replace | Propagate | BatchDefault | PreventInjection | Automatic,
  /** Reset the node to its initial value and update the computed properties at once */
  IsolateReset = Reset | Isolate,
  /** Reset the node to its initial value, normalize it and trigger a refresh */
  StableReset = Reset | Refresh | Normalize,
  /** Reset the node in isolation, normalize it and trigger a refresh */
  IsolateStableReset = StableReset | Isolate,
  /** Merge into the current value, propagate to children and trigger a refresh */
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
