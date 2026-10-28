import { appendFormattedSegment } from './appendFormattedSegment';
import { formatSegment } from './formatSegment';

/**
 * Append one decoded property name or array position to a canonical address.
 * @param parentPath - Canonical parent address; the empty string is the root.
 * @param name - Decoded name, which may be any string including the empty name, or an array position that is converted to text.
 * @returns The child address, with the name escaped by formatSegment so reserved names stay literal.
 */
export const appendSegment = (
  parentPath: string,
  name: string | number,
): string => appendFormattedSegment(parentPath, formatSegment(String(name)));
