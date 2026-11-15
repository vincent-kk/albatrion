import { isEmptyArray, isEmptyPlainObject } from '@winglet/common-utils/filter';

import { trimmedArrays } from '../../../../utils/cache/valueMemos';

/**
 * Tell whether one array item counts as empty for trailing omission.
 * @param item - Assembled branch slot or terminal source item
 * @returns Whether the item is null, undefined, '', an empty array or a plain object without own keys
 */
const isEmptyItem = (item: unknown): boolean =>
  item == null || item === '' || isEmptyArray(item) || isEmptyPlainObject(item);

/**
 * Trim the trailing run of empty items without mutation, with one rule for branch and terminal arrays.
 * The check is shallow and ignores item schemas, so a nullable item's null is trimmed while `{ name: '' }`, Date and File stay.
 * @param value - Assembled branch local or terminal source whose empty suffix is omitted
 * @returns Original array when its last item is not empty, otherwise a memoized copied prefix
 */
export const omitTrailingEmptyArray = (
  value: readonly unknown[],
): readonly unknown[] => {
  let end = value.length;
  while (end > 0 && isEmptyItem(value[end - 1])) end--;
  if (end === value.length) return value;
  const cached = trimmedArrays.get(value);
  if (cached?.end === end) {
    let unchanged = true;
    for (let index = 0; index < cached.result.length; index++)
      if (!Object.is(cached.result[index], value[index])) {
        unchanged = false;
        break;
      }
    if (unchanged) return cached.result;
  }
  const result = value.slice(0, end);
  trimmedArrays.set(value, { end, result });
  return result;
};
