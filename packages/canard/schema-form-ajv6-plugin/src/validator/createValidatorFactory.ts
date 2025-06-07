import type { JsonSchema, ValidateFunction } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { transformDataPath } from './utils/transformDataPath';

// AJV6 에러의 dataPath만 변환하는 함수

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
