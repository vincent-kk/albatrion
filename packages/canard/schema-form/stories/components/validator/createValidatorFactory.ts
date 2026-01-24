import type { JsonSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { transformErrors } from './utils/transformErrors';

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
