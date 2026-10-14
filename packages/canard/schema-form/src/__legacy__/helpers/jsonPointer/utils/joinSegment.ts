import { JSONPointer as $ } from '../enum';

/**
 * Joins a segment to a path.
 * @param basePath - The path to join the segment to.
 * @param segment - The segment to join to the path.
 * @note Use string literal type to execute faster.
 * @returns The path with the segment joined.
 */
export const joinSegment = (
  basePath: string = $.Root,
  segment: string | number,
) => (segment !== '' ? basePath + $.Separator + segment : basePath);
