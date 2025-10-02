import type { Nullish } from '@aileron/declare';

import type { ObjectValue } from '@/schema-form/types';

export const normalizeObjectValue = (
  value: ObjectValue | Nullish,
  properties: string[],
) => {
  if (value == null) return;
  const keys = Object.keys(value);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i])
    if (properties.indexOf(k) === -1) value[k] = undefined;
};
