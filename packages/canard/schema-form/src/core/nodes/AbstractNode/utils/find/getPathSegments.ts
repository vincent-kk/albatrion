import { JSONPath, isTruthy } from '@winglet/common-utils';

const ARRAY_PATTERN = /\[(\d+)\]/g;

/**
 * Splits a path string into an array of segments.
 * Converts array notation ([0]) to dot notation (.0).
 * @param path - Path string to split (ex. 'root.child[0].property')
 * @returns Array of split path segments (ex. ['root', 'child', '0', 'property'])
 */
export const getPathSegments = (path: string) =>
  path
    .replace(ARRAY_PATTERN, JSONPath.Child + '$1')
    .split(JSONPath.Child)
    .filter(isTruthy);
