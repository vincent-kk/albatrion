import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { createSchemaValidator } from './utils/createSchemaValidator';

/**
 * Create the public factory whose anonymous schemas compile in native asynchronous mode.
 * @param ajv - AJV instance supplying the compilation profile.
 * @param key - Optional already-registered root address.
 * @returns A schema factory producing promise-returning validation functions.
 */
export const createValidatorFactory =
  (ajv: Ajv.Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction =>
    createSchemaValidator(ajv, jsonSchema, key, true);
