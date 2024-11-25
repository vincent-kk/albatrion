import { Murmur3 } from '@lumy/common';
import {
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy/schema-form/types';

import { isTruthy } from './filter';

/**
 * @description oneOf 속성을 가진 JSON Schema에 대한 에러 제거
 * @param errors - JSON Schema 에러 배열
 * @param jsonSchema - JSON Schema
 * @returns 필터링된 JSON Schema 에러 배열
 */
export const filterErrors = (
  errors: JsonSchemaError[],
  jsonSchema: JsonSchema,
) => {
  // NOTE: oneOf property가 없는 경우, 필터링 하지 않음
  if (!Array.isArray(jsonSchema?.oneOf)) return errors;

  const oneOfRequiredFieldMap = new Map<string, string[]>(
    jsonSchema.oneOf
      .map(({ required }, index) => {
        if (Array.isArray(required)) {
          return [
            `${JSONPath.Filter}/oneOf/${index}/required`,
            required,
          ] as const;
        }
        return null;
      })
      .filter(isTruthy),
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
