import { hasOwnProperty } from '@winglet/common-utils/lib';
import { getDataProperty } from '@winglet/common-utils/object';

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
    if (Array.isArray(cursor) && getArrayElementIndex(segment) < 0)
      return undefined;
    if (
      segment === '__proto__' ||
      segment === 'constructor' ||
      segment === 'prototype'
    )
      cursor = getDataProperty(cursor, segment);
    else if (hasOwnProperty(cursor, segment)) cursor = cursor[segment];
    else return undefined;
    if (i === length) break;
    if (typeof cursor !== 'object' || cursor === null) return undefined;
  }
  return cursor;
};
