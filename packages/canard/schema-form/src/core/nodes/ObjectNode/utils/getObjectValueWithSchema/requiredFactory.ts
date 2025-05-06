import { isArray, map, weakMapCacheFactory } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { JsonSchema, ObjectSchema } from '@/schema-form/types';

import type { FlattenCondition } from '../flattenConditions';

const { get, set } = weakMapCacheFactory<Array<string[]>, JsonSchema>();

/**
 * 스키마 조건을 분석하여 특정 값에 대해 어떤 속성이 필수인지 결정하는 함수를 반환합니다.
 * 조건 분석은 함수 생성 시점에 수행되어 클로저에 저장됩니다.
 * @param value 현재 객체 값
 * @param conditions 평탄화된 조건 배열
 * @returns 키를 받아 해당 키가 필수인지 반환하는 함수
 */
export const requiredFactory = (
  value: Dictionary,
  schema: ObjectSchema,
  oneOfIndex: number | undefined,
  conditions: FlattenCondition[] | null,
): ((key: string) => boolean) | null => {
  if (!conditions && oneOfIndex === undefined) return null;

  const oneOfRequiredFields = getOneOfRequiredFields(schema, oneOfIndex);
  const ifConditionFields = getIfConditionFields(value, conditions);
  return (key: string) => {
    if (oneOfRequiredFields?.includes(key)) return true;
    if (ifConditionFields?.includes(key)) return true;
    return false;
  };
};

const getIfConditionFields = (
  value: Dictionary,
  conditions: FlattenCondition[] | null,
) => {
  if (!conditions) return null;
  const requiredFields: string[] = [];
  for (const { condition, required, inverse } of conditions) {
    let matches = true;
    for (const [key, conditionValue] of Object.entries(condition)) {
      requiredFields.push(key);
      const currentValue = value[key];
      if (isArray(conditionValue))
        matches = conditionValue.includes(currentValue);
      else matches = conditionValue === currentValue;
      if (!matches) break;
    }
    if (inverse) matches = !matches;
    if (matches) {
      for (const field of required) requiredFields.push(field);
    }
  }
  return requiredFields;
};

const getOneOfRequiredFields = (
  schema: JsonSchema,
  oneOfIndex: number | undefined,
) => {
  if (oneOfIndex === undefined || oneOfIndex < 0) return null;
  let oneOfDetails = get(schema);
  if (!oneOfDetails) {
    oneOfDetails = analyzeOneOfSchema(schema);
    set(schema, oneOfDetails);
  }
  return oneOfDetails[oneOfIndex] || [];
};

const analyzeOneOfSchema = (schema: JsonSchema) => {
  const oneOfDetails: Array<string[]> = [];
  const oneOfLength = schema.oneOf?.length;
  if (!oneOfLength) return oneOfDetails;
  for (let i = 0; i < oneOfLength; i++) {
    const oneOfItem = schema.oneOf![i] as JsonSchema;
    if (!oneOfItem.properties) continue;
    const required = Object.keys(oneOfItem.properties);
    oneOfDetails.push(required);
  }
  return oneOfDetails;
};
