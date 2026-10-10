import { isEmptyArray } from '@winglet/common-utils/filter';

import type { Nullish } from '@aileron/declare';

import type { ArrayValue } from '@/schema-form/types';

export const omitEmptyArray = (value: ArrayValue | Nullish) =>
  isEmptyArray(value) ? undefined : value;
