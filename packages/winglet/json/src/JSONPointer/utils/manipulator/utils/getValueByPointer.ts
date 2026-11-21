import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import { getArrayElementIndex } from '../../getArrayElementIndex';

export const getValueByPointer = <Input extends Dictionary | Array<any>>(
  value: Input,
  segments: string[],
): unknown => {
  const length = segments.length;
  const hasRootPrefix = segments[0] === '' || segments[0] === '#';
  if (length === 0 || (length === 1 && hasRootPrefix)) return value;
  let cursor: any = value;
  for (let i = hasRootPrefix ? 1 : 0; i < length; ) {
    const segment = segments[i++];
    if (
      (Array.isArray(cursor) && getArrayElementIndex(segment) < 0) ||
      !hasOwnProperty(cursor, segment)
    )
      return undefined;
    cursor = cursor[segment];
    if (i === length) break;
    if (typeof cursor !== 'object' || cursor === null) return undefined;
  }
  return cursor;
};
