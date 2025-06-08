import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
} from '@/schema-form/app/constants/bitmask';

import type { JsonSchema } from './jsonSchema';

export enum ShowError {
  /** Always show error */
  Always = BIT_FLAG_00,
  /** Never show error */
  Never = BIT_FLAG_01,
  /** Show error when the input's value is updated */
  Dirty = BIT_FLAG_02,
  /** Show error when the input is touched */
  Touched = BIT_FLAG_03,
  /** Show error when the input's value is updated and touched */
  DirtyTouched = BIT_FLAG_04,
}

export interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}

export type ValidateFunction<Value = unknown> = Fn<
  [data: Value],
  Promise<JsonSchemaError[] | null> | JsonSchemaError[] | null
>;

/**
 * Standardized JSON Schema validation error interface.
 *
 * This interface serves as a unified format for validation errors from different validators
 * (e.g., AJV, Joi, Yup, Zod). It normalizes error structures while preserving the original
 * validator-specific error data for debugging and advanced use cases.
 *
 * @template SourceError - Type of the source error from the specific validator
 *
 * @example
 * ```typescript
 * // AJV error transformation
 * const ajvError: JsonSchemaError<AjvErrorObject> = {
 *   dataPath: 'user.email',
 *   keyword: 'format',
 *   message: 'Invalid email format',
 *   source: originalAjvError
 * };
 *
 * // Joi error transformation
 * const joiError: JsonSchemaError<ValidationError> = {
 *   dataPath: 'user.age',
 *   keyword: 'minimum',
 *   message: 'Age must be at least 18',
 *   source: originalJoiError
 * };
 * ```
 */
export interface PublicJsonSchemaError<SourceError = unknown> {
  /**
   * JSON Path to the data property that failed validation.
   * @note Uses dot notation for nested objects and bracket notation for arrays.
   * @example 'user.profile.email' or '$.items[0].name'
   */
  dataPath: string;

  /**
   * Validation rule/keyword that failed.
   * @note Common keywords: 'required', 'type', 'format', 'minimum', 'maximum', 'pattern'
   * @example 'required' | 'email' | 'minLength'
   */
  keyword?: string;

  /**
   * Human-readable error message describing the validation failure.
   * @note Should be suitable for displaying to end users.
   * @example 'Email is required' | 'Must be a valid email address'
   */
  message?: string;

  /**
   * Additional context and parameters related to the validation failure.
   * @note Content varies by validation keyword (e.g., limits, patterns, allowed values).
   * @example { minimum: 18, actual: 16 } | { pattern: '^[a-zA-Z]+$' }
   */
  details?: Record<string, any>;

  /**
   * Source error object from the specific validator.
   * @note This preserves all validator-specific information, enabling:
   *   - Advanced debugging and error analysis
   *   - Access to validator-specific properties and methods
   *   - Custom error handling based on the source validator
   * @example AjvErrorObject | ValidationError | ZodError
   */
  source?: SourceError;
}

/**
 * JsonSchemaError extends PublicJsonSchemaError and adds a key property.
 * @internal
 */
export interface JsonSchemaError extends PublicJsonSchemaError {
  /**
   * Internal management property for array item errors.
   * @note This value is automatically managed and overwritten by the system.
   * @warning Users should not set or rely on this property directly.
   * @internal
   */
  key?: number;
}
