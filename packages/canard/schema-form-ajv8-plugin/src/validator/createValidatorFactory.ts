import type { JsonSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { transformErrors } from './utils/transformErrors';

/**
 * Creates a validator factory function for AJV8.
 *
 * This factory function creates validators that transform AJV8 errors to match
 * the schema-form library's error format. Since AJV8 already uses JSONPointer
 * format for dataPaths, only basic error transformation is needed.
 *
 * @param ajv - The AJV8 instance to use for validation
 * @returns A factory function that creates validators for given JSON schemas
 */
export const createValidatorFactory =
  (ajv: Ajv) =>
  (jsonSchema: JsonSchema): ValidateFunction => {
    const validate = ajv.compile({
      ...jsonSchema,
      $async: true,
    });
    return async (data) => {
      try {
        await validate(data);
        return null;
      } catch (thrown: any) {
        if (Array.isArray(thrown?.errors))
          return transformErrors(thrown.errors);
        throw thrown;
      }
    };
  };
