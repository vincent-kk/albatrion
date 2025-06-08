import { isEmptyObject } from '@winglet/common-utils/filter';

import type { ObjectValue } from '@/schema-form/types';

export const omitEmptyObject = (value: ObjectValue | undefined) =>
  isEmptyObject(value) ? undefined : value;
