import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';

/**
 * Callback a node invokes to notify its parent of a value change.
 * @remarks `automatic` marks a value the form produced by itself ; a parent that is `null` records it without becoming an object.
 */
export type HandleChange<Value = any> = Fn<
  [value: Value, batch?: boolean, automatic?: boolean]
>;

/** Bit flags controlling how a value application behaves. */
export enum WriteOption {
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

/**
 * Origin of a write before calculation and transition phases.
 * @remarks The member values are the names delivery options, misfit warnings and the settlement trace carry.
 */
export enum FieldNodeWriteKind {
  /** The bound input wrote the value. */
  Input = 'input',
  /** A caller wrote object keys and kept the ones it omitted. */
  CallerPartial = 'callerPartial',
  /** A caller replaced the addressed value. */
  CallerReplace = 'callerReplace',
  /** A load started a new source lifetime. */
  Load = 'load',
  /** The form produced the value by itself. */
  Automatic = 'automatic',
}
