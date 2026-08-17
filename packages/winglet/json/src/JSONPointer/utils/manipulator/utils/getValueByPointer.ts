import { getDataProperty } from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

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
    // Inline copy of isReservedName: a per-segment cross-module call measurably
    // slows this leanest loop; RC-5 pins both predicates to the same verdict
    cursor =
      segment === '__proto__' ||
      segment === 'constructor' ||
      segment === 'prototype'
        ? getDataProperty(cursor, segment)
        : cursor[segment];
    if (i === length) break;
    if (typeof cursor !== 'object' || cursor === null) return undefined;
  }
  return cursor;
};
