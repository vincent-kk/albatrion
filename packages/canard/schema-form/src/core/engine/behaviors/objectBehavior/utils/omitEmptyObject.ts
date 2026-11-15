import { isEmptyPlainObject } from '@winglet/common-utils/filter';

import { objectKeyCounts } from '../../../utils/cache/valueMemos';

/** Project an empty plain object as absence while retaining every other input identity, including keyless Date and File values. */
export const omitEmptyObject = (value: unknown): unknown => {
  const count =
    value !== null && typeof value === 'object'
      ? objectKeyCounts.get(value)
      : undefined;
  return (count === undefined ? isEmptyPlainObject(value) : count === 0)
    ? undefined
    : value;
};
