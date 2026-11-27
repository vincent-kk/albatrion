import type { Dictionary } from '@aileron/declare';

import type { ValidationIssue } from '@/schema-form/core';

/** Error display eligibility, independent of validation scheduling. */
export enum ErrorVisibility {
  /** Always qualify for display, subject to node presence and release rules. */
  Always = 'always',
  /** Suppress display unless a node or Form reveal overrides it. */
  Never = 'never',
  /** Require an input edit. */
  AfterEdit = 'afterEdit',
  /** Require the input to have lost focus. */
  AfterTouch = 'afterTouch',
  /** Require both an input edit and a blur. */
  AfterEditAndTouch = 'afterEditAndTouch',
  /** Require either an input edit or a blur. */
  AfterEditOrTouch = 'afterEditOrTouch',
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
