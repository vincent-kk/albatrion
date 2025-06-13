import type { JsonSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { transformDataPath } from './utils/transformDataPath';

/**
 * Creates a validator factory function that transforms AJV7 error dataPaths.
 *
 * This factory function creates validators that handle AJV7's dataPath format.
 * AJV7 uses JSONPointer format by default, but we still need to handle
 * required field errors specially to append the missing property name.
 *
 * @param ajv - The AJV7 instance to use for validation
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
