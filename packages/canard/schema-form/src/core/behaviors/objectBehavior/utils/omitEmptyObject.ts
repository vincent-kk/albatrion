import { isEmptyObject } from '@winglet/common-utils/filter';
import { objectKeyCounts } from './objectKeyCounts';

/** Project an empty object as absence while retaining non-empty input identity. */
export const omitEmptyObject = (value: unknown): unknown => {
  const count = value !== null && typeof value === 'object'
    ? objectKeyCounts.get(value) : undefined;
  return (count === undefined ? isEmptyObject(value) : count === 0)
    ? undefined : value;
};
