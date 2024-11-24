import { Murmur3 } from '@lumy/common';
import {
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy/schema-form/types';

import { isTruthy } from './filter';

export const filterErrors = (
  errors: JsonSchemaError[],
  jsonSchema: JsonSchema,
) => {
  const oneOfRequiredFieldMap = new Map<string, string[]>(
    jsonSchema?.oneOf
      ?.map(({ required }, index) => {
        if (Array.isArray(required)) {
          return [
            `${JSONPath.Filter}/oneOf/${index}/required`,
            required,
          ] as const;
        }
        return null;
      })
      .filter(isTruthy) || [],
  );
  return errors.filter(({ keyword, schemaPath, params }) => {
    if (keyword === 'oneOf') return false;
    if (schemaPath?.includes('oneOf')) {
      return (
        params?.missingPattern &&
        !oneOfRequiredFieldMap.get(schemaPath)?.includes(params.missingPattern)
      );
    }
    return true;
  });
};

export const serializeError = ({ schemaPath, params = {} }: JsonSchemaError) =>
  `${schemaPath}?${Object.entries(params)
    .map(([key, value]) => `${key}=${value?.toString?.() ?? ''}`)
    .join('&')}`;

export const serializeErrors = (errors: JsonSchemaError[]) =>
  errors.map(serializeError).join('|');

export const getErrorsHash = (errors: JsonSchemaError[]) =>
  new Murmur3(serializeErrors(errors)).result();
