import { isEmptyPlainObject } from '@winglet/common-utils/filter';

import { objectKeyCounts } from '../../../utils/cache/valueMemos';

/**
 * Project an empty plain object as absence (empty-values).
 * @param value - Object value to emit; an assembled object's memoized key count decides first
 * @returns `undefined` for an empty plain object; otherwise `value` by reference, including a keyless Date or File
 */
export const omitEmptyObject = (value: unknown): unknown => {
  const count =
    value !== null && typeof value === 'object'
      ? objectKeyCounts.get(value)
      : undefined;
  return (count === undefined ? isEmptyPlainObject(value) : count === 0)
    ? undefined
    : value;
};
