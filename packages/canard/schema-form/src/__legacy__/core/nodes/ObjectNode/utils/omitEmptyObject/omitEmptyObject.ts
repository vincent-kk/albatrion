import { isEmptyObject } from '@winglet/common-utils/filter';

import type { Nullish } from '@aileron/declare';

import type { ObjectValue } from '@/schema-form/__legacy__/types';

export const omitEmptyObject = (value: ObjectValue | Nullish) =>
  isEmptyObject(value) ? undefined : value;
