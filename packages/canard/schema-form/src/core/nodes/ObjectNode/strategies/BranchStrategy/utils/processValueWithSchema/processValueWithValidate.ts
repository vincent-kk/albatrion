import type { Fn } from '@aileron/declare';

import type { ObjectValue } from '@/schema-form/types';

/**
 * Filter object value by validating each key with the provided validation function
 *
 * @param value - Object value to filter
 * @param validate - Validation function that returns true for keys that should be included
 * @returns Object value filtered according to validation function, or original value if no validation function provided
 */
export const processValueWithValidate = (
  value: ObjectValue | undefined,
  validate?: Fn<[key: string], boolean>,
): ObjectValue | undefined => {
  if (value == null || validate === undefined) return value;
  const keys = Object.keys(value);
  if (keys.length === 0) return value;
  const result: ObjectValue = {};
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i])
    if (validate(k)) result[k] = value[k];
  return result;
};
