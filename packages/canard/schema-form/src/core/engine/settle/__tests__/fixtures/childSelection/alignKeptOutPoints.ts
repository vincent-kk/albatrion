import { isDeepStrictEqual } from 'node:util';

import { isArray } from '@winglet/common-utils/filter';

/**
 * Drop from the pinned HEAD points only the `selectChildren` points of hosts W1 kept out of shape-dirty.
 * Walks both lists in order; a HEAD point the candidate lacks is dropped only when it is a
 * `selectChildren` point of a kept-out host, at most once per kept-out write.
 * @param head - Pinned HEAD points in publication order
 * @param working - Candidate points in publication order
 * @param keptOut - Host paths the candidate kept out of shape-dirty, one entry per write
 * @returns HEAD points without the allowed missing points; any other difference is kept for the caller's comparison
 */
export const alignKeptOutPoints = (
  head: readonly unknown[],
  working: readonly unknown[],
  keptOut: readonly string[],
): unknown[] => {
  const allowance = [...keptOut];
  const aligned: unknown[] = [];
  let cursor = 0;
  for (const point of head) {
    if (cursor < working.length && isDeepStrictEqual(point, working[cursor])) {
      aligned.push(point);
      cursor++;
      continue;
    }
    const path = selectionPath(point);
    const index = path === undefined ? -1 : allowance.indexOf(path);
    if (index < 0) aligned.push(point);
    else allowance.splice(index, 1);
  }
  return aligned;
};

/**
 * Read the host path of a normalized `selectChildren` point.
 * @param point - Normalized point: an array of `[field, value]` entries
 * @returns The host path, or undefined for any other point
 */
const selectionPath = (point: unknown): string | undefined => {
  if (!isArray(point)) return undefined;
  const field = (name: string) =>
    point.find((entry) => isArray(entry) && entry[0] === name)?.[1];
  const path = field('path');
  return field('label') === 'selectChildren' && typeof path === 'string'
    ? path
    : undefined;
};
