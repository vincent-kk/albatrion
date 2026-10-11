import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_MASK_NONE,
} from '@/schema-form/app/constants';

/**
 * Callback a node invokes to notify its parent of a value change.
 * @remarks `automatic` marks a value the form produced by itself ; a parent that is `null` records it without becoming an object.
 */
export type HandleChange<Value = any> = Fn<
  [value: Value, batch?: boolean, automatic?: boolean]
>;

/** Bit flags controlling how a value application behaves. */
export enum SetValueOption {
  /** Internal empty option accumulator. */
  None = BIT_MASK_NONE,
  /** Internal whole-replacement mark for array batch composition. */
  Replace = BIT_FLAG_00,
  /** Replace the addressed value, preserving existing node lifetimes. */
  Overwrite = BIT_FLAG_00,
  /** Retain omitted object keys while replacing supplied values. */
  Merge = BIT_FLAG_01,
  /** Suppress automatic writes caused by this call. */
  DisableAutomaticWrites = BIT_FLAG_02,
  /** Enable automatic writes even when the form suppresses them. */
  EnableAutomaticWrites = BIT_FLAG_03,
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
