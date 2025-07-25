import type { ObjectValue } from '@/schema-form/types';

import type { FieldConditionMap } from '../getFieldConditionMap';
import { requiredFactory } from './utils/requiredFactory';

/**
 * Function to extract necessary data based on given value and schema
 *
 * @param value Original object value
 * @param schema Object schema definition
 * @param oneOfIndex Index of selected schema among oneOf (if none or less than -1, remove all oneOf fields)
 * @param conditions Conditions to use for filtering (if none, no filtering)
 * @returns Object value filtered according to schema and conditions
 */
export const processValueWithCondition = (
  value: ObjectValue | undefined,
  fieldConditionMap: FieldConditionMap | undefined,
): ObjectValue | undefined => {
  if (value == null || !fieldConditionMap) return value;

  const inputKeys = Object.keys(value);
  if (!inputKeys.length) return value;

  const isRequired = requiredFactory(value, fieldConditionMap);
  const filteredValue: ObjectValue = {};
  for (let i = 0; i < inputKeys.length; i++) {
    const key = inputKeys[i];
    if (!isRequired(key)) continue;
    filteredValue[key] = value[key];
  }
  return filteredValue;
};
