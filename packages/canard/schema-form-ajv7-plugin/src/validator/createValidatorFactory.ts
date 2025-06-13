import type { JsonSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { transformDataPath } from './utils/transformDataPath';

/**
 * Creates a validator factory function that transforms AJV6 error dataPaths.
 *
 * This factory function creates validators that automatically convert AJV6's JSONPath format
 * error dataPaths to JSONPointer format for consistency with the schema-form library.
 *
 * @param ajv - The AJV instance to use for validation
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
          return transformDataPath(thrown.errors);
        throw thrown;
      }
    };
  };
