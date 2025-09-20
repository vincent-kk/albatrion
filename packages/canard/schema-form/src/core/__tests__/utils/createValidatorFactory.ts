import type Ajv from 'ajv';
import type { ErrorObject } from 'ajv';

import { JSONPointer as $ } from '@winglet/json/pointer';

import type {
  JsonSchema,
  JsonSchemaError,
  ValidateFunction,
} from '@/schema-form/types';

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

const transformErrors = (errors: ErrorObject[]): JsonSchemaError[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<JsonSchemaError>(errors.length);
  for (let index = 0; index < errors.length; index++) {
    const originalError = errors[index];
    const transformedError: JsonSchemaError = {
      dataPath: transformDataPath(originalError),
      keyword: originalError.keyword,
      message: originalError.message,
      details: originalError.params || {},
      source: originalError,
      key: undefined,
    };
    result[index] = transformedError;
  }
  return result;
};

const transformDataPath = (error: ErrorObject): string => {
  const instancePath = error.instancePath;
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  if (!instancePath)
    return hasMissingProperty ? $.Separator + error.params.missingProperty : '';

  return hasMissingProperty
    ? instancePath + $.Separator + error.params.missingProperty
    : instancePath;
};
