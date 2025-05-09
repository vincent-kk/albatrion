import { JSONPath } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * JSON 스키마 컴파일 오류가 발생했을 때 사용할 폴백 밸리데이터를 생성합니다.
 * 실행시에 실패 정보를 포함한 오류를 반환합니다.
 * @param error - 원본 컴파일 오류
 * @param jsonSchema - 원본 JSON 스키마
 * @returns 폴백 밸리데이터 함수
 */
export const getFallbackValidator = (
  error: Error,
  jsonSchema: JsonSchemaWithVirtual,
) =>
  Object.assign(
    (_: unknown): _ is unknown => {
      throw {
        errors: [
          {
            keyword: 'jsonSchemaCompileFailed',
            instancePath: JSONPath.Root,
            message: error.message,
            params: {
              error,
            },
          },
        ],
      };
    },
    {
      errors: null,
      schema: jsonSchema,
      schemaEnv: {} as any,
    },
  );
