/** Reuse a segment already produced by formatSegment when the caller also stores escapedName. */
export const appendFormattedSegment = (
  parentPath: string,
  formattedName: string,
): string => parentPath + '/' + formattedName;
