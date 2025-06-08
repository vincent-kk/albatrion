import { isEmptyArray } from '@winglet/common-utils/filter';

import type { ArrayValue } from '@/schema-form/types';

export const omitEmptyArray = (value: ArrayValue | undefined) =>
  isEmptyArray(value) ? undefined : value;
