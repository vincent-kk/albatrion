import type { Dictionary } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
} from '@/schema-form/constants/bitmask';
import type { ValidationIssue } from '@/schema-form/core';

export enum ShowError {
  /** Always show error */
  Always = BIT_FLAG_00,
  /** Never show error */
  Never = BIT_FLAG_01,
  /** Show error when the input's value is updated */
  Edited = BIT_FLAG_02,
  /** Show error when the input is touched */
  Touched = BIT_FLAG_03,
  /** Show error when the input's value is updated and touched */
  EditedTouched = BIT_FLAG_04,
}

/** Form validator prop: the core object contract requires synchronous guard compilation. */
export type {
  Validator as ValidatorFactory,
  ValidateFunction,
} from '@/schema-form/core';

/** Normalized validation results belong to the engine contract. */
export type { ValidationIssue } from '@/schema-form/core';

/**
 * Renderer errors extend ValidationIssue with an internally managed array item key.
 */
export interface JSONSchemaError<SourceError = unknown>
  extends ValidationIssue<SourceError> {
  /** Renderer keyword parameters accept validator-specific values. */
  details?: Dictionary;
  /**
   * Internal management property for array item errors.
   * @note This value is automatically managed and overwritten by the system.
   * @warning Users should not set or rely on this property directly.
   */
  key?: number;
}
