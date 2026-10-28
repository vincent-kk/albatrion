/**
 * Append a segment that formatSegment already produced, avoiding a second escape.
 * @param parentPath - Canonical parent address; the empty string is the root.
 * @param formattedName - Output of formatSegment for one name, or the encoded segment a node already stores as its escaped name.
 * @returns The parent address followed by `/` and the segment.
 */
export const appendFormattedSegment = (
  parentPath: string,
  formattedName: string,
): string => parentPath + '/' + formattedName;
