import { appendFormattedSegment } from './appendFormattedSegment';
import { formatSegment } from './formatSegment';

/** Append one decoded name, including an empty property name. */
export const appendSegment = (
  parentPath: string,
  name: string | number,
): string => appendFormattedSegment(parentPath, formatSegment(String(name)));
