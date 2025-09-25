import type { Fn } from '@aileron/declare';

import type { ObjectValue } from '@/schema-form/types';

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
