import { difference } from '@winglet/common-utils';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import type { FlattenCondition } from '../flattenConditions';
import { requiredFactory } from './requiredFactory';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수
 * @param value 추출할 값
 * @param conditions 추출할 값의 스키마
 * @param options 추출 옵션
 * @returns 추출된 값
 */
export const getObjectValueWithSchema = (
  value: ObjectValue | undefined,
  schema: ObjectSchema,
  oneOfIndex: number | undefined,
  conditions: FlattenCondition[] | undefined,
): ObjectValue | undefined => {
  if (value == null || !conditions) return value;

  const properties = schema.properties;
  const propertyKeys = properties ? Object.keys(properties) : null;
  if (propertyKeys?.length) {
    const computedValue: ObjectValue = {};
    const inputKeys = Object.keys(value);
    const differenceKeys = difference(inputKeys, propertyKeys);
    const required = requiredFactory(value, schema, oneOfIndex, conditions);
    for (let i = 0; i < propertyKeys.length; i++) {
      const key = propertyKeys[i];
      if (key in value && (!required || required(key)))
        computedValue[key] = value[key];
    }
    if (differenceKeys.length)
      for (let i = 0; i < differenceKeys.length; i++) {
        const key = differenceKeys[i];
        if (key in properties!) continue;
        computedValue[key] = value[key];
      }
    return computedValue;
  } else return value;
};
