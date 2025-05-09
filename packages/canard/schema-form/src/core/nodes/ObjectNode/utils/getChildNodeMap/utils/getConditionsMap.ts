import { JSONPath, isString, serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { FieldConditionMap } from '../../getFieldConditionMap';

/**
 * FieldConditionMap를 기반으로 executable code 목록을 field 별로 생성합니다.
 * @param fieldConditionMap - 필드 조건 맵
 * @returns 필드와 executable code 목록을 포함한 맵. 또는 조건이 없을 경우 undefined
 */
export const getConditionsMap = (
  fieldConditionMap: FieldConditionMap | undefined,
): Map<string, string[]> | undefined => {
  if (!fieldConditionMap) return undefined;
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const [field, conditions] of fieldConditionMap.entries()) {
    if (conditions === true) continue;
    const operations: string[] = [];
    for (let i = 0; i < conditions.length; i++)
      getOperations(conditions[i].condition, conditions[i].inverse, operations);

    oneOfConditionsMap.set(field, operations);
  }
  return oneOfConditionsMap;
};

/**
 * 조건에서 executable code 문자열을 생성합니다.
 * @param condition - 조건 사전
 * @param inverse - 역조건 여부
 * @param operations - 결과를 저장할 배열
 */
const getOperations = (
  condition: Dictionary<string | string[]>,
  inverse: boolean | undefined,
  operations: string[],
) => {
  for (const [key, value] of Object.entries(condition)) {
    if (isString(value))
      operations.push(
        `${JSONPath.Parent}${JSONPath.Child}${key}${inverse ? '!==' : '==='}${serializeNative(value)}`,
      );
    else
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes(${JSONPath.Parent}${JSONPath.Child}${key})`,
      );
  }
};
