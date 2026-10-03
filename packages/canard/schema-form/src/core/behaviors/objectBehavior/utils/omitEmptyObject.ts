import { isEmptyObject } from '@winglet/common-utils/filter';

/** Project an empty object as absence while retaining non-empty input identity. */
export const omitEmptyObject = (value: unknown): unknown =>
  isEmptyObject(value) ? undefined : value;
