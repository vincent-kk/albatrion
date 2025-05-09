import { isTruthy, map, merge } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * JSON 스키마와 조건을 병합하여 새로운 스키마를 반환합니다.
 * @param jsonSchema - 원본 JSON 스키마
 * @param conditions - 처리할 조건 목록
 * @returns 조건이 반영된 새로운 스키마 또는 조건이 없을 경우 원본 스키마
 */
export const mergeShowConditions = (
  jsonSchema: JsonSchemaWithVirtual,
  conditions: string[] | undefined,
) =>
  conditions
    ? merge(jsonSchema, {
        computed: {
          visible: combineConditions(
            [
              jsonSchema.computed?.visible ?? jsonSchema['&visible'],
              combineConditions(conditions || [], '||'),
            ],
            '&&',
          ),
        },
      })
    : jsonSchema;

/**
 * 여러 조건을 지정된 연산자로 결합하는 함수입니다.
 * @param conditions - 결합할 조건들
 * @param operator - 사용할 연산자('&&' 또는 '||')
 * @returns 결합된 조건 식
 */
const combineConditions = (
  conditions: (string | boolean | undefined)[],
  operator: string,
) => {
  const filtered = conditions.filter(isTruthy);
  if (filtered.length === 1) return filtered[0];
  return map(filtered, (item) => `(${item})`).join(`${operator}`);
};
