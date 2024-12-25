import { isTruthy } from '@winglet/common-utils';

import { JSONPath } from '@/schema-form/types';

const ARRAY_PATTERN = /\[(\d+)\]/g;

export const getPathSegments = (path: string) =>
  path
    .replace(ARRAY_PATTERN, `${JSONPath.Child}$1`)
    .split(JSONPath.Child)
    .filter(isTruthy);
