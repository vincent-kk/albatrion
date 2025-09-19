import { JSONPointer } from '../enum';

/**
 * Joins a segment to a path.
 * @param path - The path to join the segment to.
 * @param segment - The segment to join to the path.
 * @note Use string literal type to execute faster.
 * @returns The path with the segment joined.
 */
export const joinSegment = (path: string | undefined, segment: string) =>
  path ? (path === $S ? path + segment : path + $S + segment) : $S;

const $S = JSONPointer.Separator;
