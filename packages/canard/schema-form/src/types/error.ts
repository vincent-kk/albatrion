import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
} from '@/schema-form/app/constants';

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

/**
 * Factory function that creates validators for JSON Schema validation.
 *
 * Takes a JSON Schema and returns a validation function configured for that schema.
 * This abstraction allows different validation libraries (AJV, Joi, Yup, etc.) to be
 * integrated with schema-form by implementing this interface.
 *
 * @param schema - JSON Schema to compile into a validator
 * @returns A validation function for the given schema
 *
 * @example
 * Using AJV8 validator factory:
 * ```typescript
 * import Ajv from 'ajv';
 *
 * const ajv = new Ajv({ allErrors: true });
 *
 * const validatorFactory: ValidatorFactory = (jsonSchema) => {
 *   const validate = ajv.compile(jsonSchema);
 *
 *   return (value) => {
 *     validate(value);
 *     return validate.errors?.map(err => ({
 *       dataPath: err.instancePath,
 *       keyword: err.keyword,
 *       message: err.message,
 *       details: err.params,
 *       source: err,
 *     })) || null;
 *   };
 * };
 * ```
 *
 * @example
 * Using async validation with AJV8 (from schema-form-ajv8-plugin):
 * ```typescript
 * import Ajv from 'ajv';
 *
 * const ajv = new Ajv({ allErrors: true });
 *
 * const validatorFactory: ValidatorFactory = (jsonSchema) => {
 *   const validate = ajv.compile({
 *     ...jsonSchema,
 *     $async: true,
 *   });
 *
 *   return async (data) => {
 *     try {
 *       await validate(data);
 *       return null;
 *     } catch (thrown) {
 *       if (Array.isArray(thrown?.errors)) {
 *         return thrown.errors.map(err => ({
 *           dataPath: err.keyword === 'required'
 *             ? err.instancePath + '/' + err.params.missingProperty
 *             : err.instancePath,
 *           keyword: err.keyword,
 *           message: err.message,
 *           details: err.params,
 *           source: err,
 *         }));
 *       }
 *       throw thrown;
 *     }
 *   };
 * };
 * ```
 *
 * @example
 * Custom async validator with external API:
 * ```typescript
 * const asyncValidatorFactory: ValidatorFactory = (jsonSchema) => {
 *   return async (value) => {
 *     const errors: JsonSchemaError[] = [];
 *
 *     // Custom validation logic
 *     if (jsonSchema.type === 'string' && jsonSchema.format === 'email') {
 *       const isValid = await checkEmailExists(value);
 *       if (!isValid) {
 *         errors.push({
 *           dataPath: '',
 *           keyword: 'format',
 *           message: 'Email does not exist',
 *           details: { format: 'email', actual: value },
 *         });
 *       }
 *     }
 *
 *     return errors.length > 0 ? errors : null;
 *   };
 * };
 * ```
 */
export interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}

/**
 * Validation function that checks data against a pre-compiled JSON Schema.
 *
 * Created by a ValidatorFactory, this function performs the actual validation
 * of data values. It can be synchronous or asynchronous, returning either
 * an array of errors or null if validation passes.
 *
 * @typeParam Value - The expected type of data to validate
 * @param data - The data to validate
 * @returns Array of validation errors, or null if validation passes
 *
 * @example
 * Basic synchronous validation:
 * ```typescript
 * const validateString: ValidateFunction<string> = (data) => {
 *   if (typeof data !== 'string') {
 *     return [{
 *       dataPath: '',
 *       keyword: 'type',
 *       message: 'must be string',
 *       details: { type: 'string', actual: typeof data },
 *     }];
 *   }
 *   return null;
 * };
 *
 * const errors = validateString(123);
 * // errors = [{ dataPath: '', keyword: 'type', ... }]
 * ```
 *
 * @example
 * Async validation with external API:
 * ```typescript
 * const validateUsername: ValidateFunction<string> = async (username) => {
 *   // Check format first
 *   if (!/^[a-zA-Z0-9_]+$/.test(username)) {
 *     return [{
 *       dataPath: '',
 *       keyword: 'pattern',
 *       message: 'Username can only contain letters, numbers, and underscores',
 *       details: { pattern: '^[a-zA-Z0-9_]+$' },
 *     }];
 *   }
 *
 *   // Check availability
 *   const isAvailable = await checkUsernameAvailability(username);
 *   if (!isAvailable) {
 *     return [{
 *       dataPath: '',
 *       keyword: 'uniqueUsername',
 *       message: 'Username is already taken',
 *       details: { value: username },
 *     }];
 *   }
 *
 *   return null;
 * };
 * ```
 *
 * @example
 * Nested object validation:
 * ```typescript
 * const validateUser: ValidateFunction = (data) => {
 *   const errors: JsonSchemaError[] = [];
 *
 *   if (!data.email) {
 *     errors.push({
 *       dataPath: '/email',
 *       keyword: 'required',
 *       message: 'Email is required',
 *     });
 *   }
 *
 *   if (data.age && data.age < 18) {
 *     errors.push({
 *       dataPath: '/age',
 *       keyword: 'minimum',
 *       message: 'Must be at least 18 years old',
 *       details: { minimum: 18, actual: data.age },
 *     });
 *   }
 *
 *   return errors.length > 0 ? errors : null;
 * };
 * ```
 */
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
 *   dataPath: '/user/email',
 *   keyword: 'format',
 *   message: 'Invalid email format',
 *   source: originalAjvError
 * };
 *
 * // Joi error transformation
 * const joiError: JsonSchemaError<ValidationError> = {
 *   dataPath: '/user/age',
 *   keyword: 'minimum',
 *   message: 'Age must be at least 18',
 *   source: originalJoiError
 * };
 * ```
 */
export interface PublicJsonSchemaError<SourceError = unknown> {
  /**
   * JSON Pointer to the data property that failed validation.
   * @note Use JSON Pointer notation for nested objects and arrays
   * @see https://datatracker.ietf.org/doc/html/rfc6901
   * @example '/user/profile/email' or '/items/0/name'
   */
  dataPath: string;

  /**
   * JSON Pointer to the schema definition that triggered the validation error.
   * @note Useful for identifying which schema rule/constraint was violated
   * @see https://datatracker.ietf.org/doc/html/rfc6901
   * @example '/properties/user/properties/email/format' | '/items/properties/price/minimum'
   */
  schemaPath?: string;

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
 * JsonSchemaError extends PublicJsonSchemaError and adds `key` property.
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
