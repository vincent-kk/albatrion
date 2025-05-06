import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { FlattenCondition } from '../flattenConditions';
import { getSchemaDetails } from './utils/getSchemaDetails';
import { requiredFactory } from './utils/requiredFactory';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수
 *
 * @param value 원본 객체 값
 * @param schema 객체 스키마 정의
 * @param oneOfIndex oneOf 중 선택된 스키마의 인덱스 (없거나 -1 미만이면 oneOf 필드 모두 제거)
 * @param conditions 필터링에 사용할 조건들 (없으면 필터링하지 않음)
 * @returns 스키마와 조건에 맞게 필터링된 객체 값
 */
export const getObjectValueWithSchema = (
  value: ObjectValue | undefined,
  schema: ObjectSchema,
  oneOfIndex: number | undefined,
  conditions: FlattenCondition[] | undefined,
): ObjectValue | undefined => {
  // 1. 빠른 조기 반환
  if (value == null) return value;
  if (!value) return value; // 빈 객체 빠른 검사

  // 2. 속성 직접 접근으로 변수 최소화
  const schemaOneOf = schema.oneOf;
  const hasOneOf = schemaOneOf && schemaOneOf.length > 0;
  const hasConditions = conditions && conditions.length > 0;

  // 3. 필터링 필요 없는 경우 즉시 반환
  if (!hasConditions && !hasOneOf) return value;
  const properties = schema.properties;
  if (!properties && !hasOneOf) return value;

  // 4. 입력 키 미리 추출 (최적화를 위한 길이 검사)
  const inputKeys = Object.keys(value);
  if (!inputKeys.length) return {}; // 빈 객체면 빈 결과 반환

  // 5. 키맵 생성 최적화 (한번에 처리)
  const keyMap = Object.create(null);
  let needsFiltering = false;

  // 6. 프로퍼티 키 추가 (길이 체크 먼저)
  const { propertyKeys, oneOfRequiredKeys } = getSchemaDetails(schema);
  // propertyKeys 처리 최적화
  if (propertyKeys?.length) {
    needsFiltering = true;
    for (let i = 0, len = propertyKeys.length; i < len; i++)
      keyMap[propertyKeys[i]] = 1;
  }

  // 7. oneOf 유효성 검사 (한번만 계산)
  const isValidOneOf =
    oneOfIndex !== undefined &&
    oneOfIndex >= 0 &&
    hasOneOf &&
    oneOfIndex < schemaOneOf!.length;

  // 8. activeOneOfProps 계산 최적화 (조건부 접근 최소화)
  const activeOneOfSchema = isValidOneOf ? schemaOneOf![oneOfIndex!] : null;
  const activeOneOfProps = activeOneOfSchema?.properties;

  // 9. oneOf 키 추가 최적화
  if (hasOneOf) {
    needsFiltering = true;
    const oneOfSchemas = schemaOneOf!;
    for (let i = 0, len = oneOfSchemas.length; i < len; i++) {
      const props = oneOfSchemas[i].properties;
      if (props) {
        // 키 추출 한번만 하고 재사용
        const propKeys = Object.keys(props);
        for (let j = 0, propLen = propKeys.length; j < propLen; j++)
          keyMap[propKeys[j]] = 1;
      }
    }
  }

  // 10. required 키 추가 최적화
  if (oneOfRequiredKeys.length) {
    needsFiltering = true;
    for (let i = 0, len = oneOfRequiredKeys.length; i < len; i++) {
      const required = oneOfRequiredKeys[i];
      for (let j = 0, reqLen = required.length; j < reqLen; j++)
        keyMap[required[j]] = 1;
    }
  }

  // 11. 필터링이 필요 없으면 원본 반환
  if (!needsFiltering) return value;

  // 12. 조건부 필터링 함수 한번만 계산
  const isRequired = hasConditions ? requiredFactory(value, conditions) : null;

  // 13. 결과 객체 (최적화를 위해 예상 크기 추정)
  const computedValue: ObjectValue = {};

  // 14. 단일 루프로 처리 최적화
  for (let i = 0, len = inputKeys.length; i < len; i++) {
    const key = inputKeys[i];
    // in 연산자 대신 직접 접근
    if (keyMap[key]) {
      // 필터링 조건 최적화 (비용이 낮은 검사 먼저)
      const isInProperties = properties && properties[key] !== undefined;
      // oneOf 필터링 (직접 접근 방식으로 변경)
      let shouldInclude = true;
      if (hasOneOf && !isInProperties)
        shouldInclude =
          isValidOneOf &&
          activeOneOfProps &&
          activeOneOfProps[key] !== undefined;
      // 조건 필터링 (가장 비용이 높은 연산 마지막에)
      if (shouldInclude && hasConditions && isRequired)
        shouldInclude = isRequired(key);
      if (shouldInclude) computedValue[key] = value[key];
    } else computedValue[key] = value[key];
  }

  return computedValue;
};
