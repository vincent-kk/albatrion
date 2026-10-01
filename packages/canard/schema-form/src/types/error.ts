import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
} from '@/schema-form/app/constants';

import type { JSONSchema } from './jsonSchema';
import type { ValidationIssue } from '@/schema-form/core/validation';

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
 * This public factory keeps its legacy shape until PR-7; the engine contract is core/validation's Validator.
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
 *     const errors: JSONSchemaError[] = [];
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
  (schema: JSONSchema): ValidateFunction<any>;
}

/**
 * Validation function that checks data against a pre-compiled JSON Schema.
 * This public function keeps its legacy shape until PR-7; the engine contract is core/validation's ValidateFunction.
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
 *   const errors: JSONSchemaError[] = [];
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
  Promise<JSONSchemaError[] | null> | JSONSchemaError[] | null
>;

/** Normalized validation results belong to the engine contract. */
export type { ValidationIssue } from '@/schema-form/core/validation';

/**
 * Legacy JSONSchemaError extends ValidationIssue and adds `key` property.
 */
export interface JSONSchemaError extends ValidationIssue {
  /** Legacy keyword parameters remain permissive until the PR-7 public engine switch. */
  details?: Record<string, any>;
  /**
   * Internal management property for array item errors.
   * @note This value is automatically managed and overwritten by the system.
   * @warning Users should not set or rely on this property directly.
   */
  key?: number;
}
