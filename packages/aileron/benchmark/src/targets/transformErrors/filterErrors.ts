import { isArray } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json';

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
  const oneOfRequiredFieldMap = new Map<string, string[]>();
  if (isArray(jsonSchema.oneOf)) {
    for (let i = 0; i < jsonSchema.oneOf.length; i++) {
      const schema = jsonSchema.oneOf[i];
      if (!isArray(schema.required)) continue;
      oneOfRequiredFieldMap.set(
        `${JSONPath.Filter}/oneOf/${i}/required`,
        schema.required,
      );
    }
  }
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
