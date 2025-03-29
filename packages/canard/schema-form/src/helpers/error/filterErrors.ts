import { isTruthy } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json-schema';

import type {
  JsonSchemaError,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

/**
 * @description oneOf 속성을 가진 JSON Schema에 대한 에러 제거
 * @param errors - JSON Schema 에러 배열
 * @param jsonSchema - JSON Schema
 * @returns 필터링된 JSON Schema 에러 배열
 */
export const filterErrors = (
  errors: JsonSchemaError[],
  jsonSchema: JsonSchemaWithVirtual,
) => {
  const oneOfRequiredFieldMap = new Map<string, string[]>(
    jsonSchema.oneOf
      ?.map(({ required }, index) => {
        if (!Array.isArray(required)) return null;
        return [
          `${JSONPath.Filter}/oneOf/${index}/required`,
          required,
        ] as const;
      })
      .filter(isTruthy),
  );
  return errors.filter(({ keyword, schemaPath, params }) => {
    if (keyword === 'oneOf' || keyword === 'enum') return false;
    if (schemaPath?.includes('oneOf')) {
      return (
        params?.missingPattern &&
        !oneOfRequiredFieldMap.get(schemaPath)?.includes(params.missingPattern)
      );
    }
    return true;
  });
};
