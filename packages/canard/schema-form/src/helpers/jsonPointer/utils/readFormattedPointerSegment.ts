import { maxLite } from '@winglet/common-utils/math';

import type { Optional } from '@aileron/declare';

import { JSONPointer as $ } from '../constants/JSONPointer';

/**
 * Read one encoded segment without constructing a split array.
 * @param path - Canonical address, with an optional `/` or `#/` prefix.
 * @param index - Zero-based position from the start, or a negative position counted from the end (-1 is the last segment).
 * @returns The segment text exactly as written in the address, or undefined for the root or a position outside the address.
 */
export const readFormattedPointerSegment = (
  path: string,
  index: number,
): Optional<string> => {
  if (path === $.Root || path === $.Fragment) return undefined;
  const offset = path.startsWith($.Fragment + $.Separator)
    ? 2
    : path[0] === $.Separator
      ? 1
      : 0;
  let start = offset;
  let end = path.length;
  if (index < 0) {
    for (let position = -1; position > index; position--) {
      end = path.lastIndexOf($.Separator, end - 1);
      if (end < offset) return undefined;
    }
    start = maxLite(offset, path.lastIndexOf($.Separator, end - 1) + 1);
  } else {
    for (let position = 0; position < index; position++) {
      start = path.indexOf($.Separator, start);
      if (start < 0) return undefined;
      start++;
    }
    const next = path.indexOf($.Separator, start);
    if (next >= 0) end = next;
  }
  return path.slice(start, end);
};
