import type { ObservationDifference } from './types';

/**
 * Build the differences omitEmpty leaves when it drops a live empty string from the output.
 * The live node keeps `''` as its source and value while a fresh load of the output receives
 * nothing (VALUE-031 round-trip table in `src/core/engine/settle/DETAIL.md`).
 * @param pointer - Escaped observation key of the omitted node, such as `~1source~1data`.
 * @returns The node's `source` and `value` differences, in comparison order.
 */
export function createOmitEmptyDifferences(
  pointer: string,
): ObservationDifference[] {
  return [
    { path: `/nodes/${pointer}/source`, updated: '', fresh: undefined },
    { path: `/nodes/${pointer}/value`, updated: '', fresh: undefined },
  ];
}
