import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { FieldConditionMap } from '../getFieldConditionMap';
import { requiredFactory } from './utils/requiredFactory';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수 (고효율 버전)
 * @param value 추출할 값
 * @param schema 추출할 값의 스키마
 * @param fieldConditionMap 필드별 조건 Map
 * @returns 추출된 값
 */
export const getValueWithCondition = (
  value: ObjectValue | undefined,
  schema: ObjectSchema,
  fieldConditionMap: FieldConditionMap | undefined,
): ObjectValue | undefined => {
  if (value == null || !fieldConditionMap) return value;

  const properties = schema.properties;
  const propertyKeys = properties ? Object.keys(properties) : null;
  const inputKeys = Object.keys(value);
  if (!properties || !propertyKeys?.length) return value;
  if (!inputKeys.length) return {};

  const required = requiredFactory(value, fieldConditionMap);
  const filteredValue: ObjectValue = {};

  for (let i = 0, len = inputKeys.length; i < len; i++) {
    const key = inputKeys[i];
    if (key in properties) {
      if (!required || required(key)) filteredValue[key] = value[key];
    } else filteredValue[key] = value[key];
  }
  return filteredValue;
};
