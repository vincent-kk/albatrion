import { escapeSegment } from '@winglet/json/pointer-escape';

/**
 * Encode a decoded name as one address segment.
 * @param name - Decoded property name; any string is valid.
 * @returns The name with `~` and `/` escaped. Exactly `*`, `..`, `.` and `@` become their percent spellings so they are not read as operators; ordinary names, including percent-containing ones, are otherwise unchanged.
 */
export const formatSegment = (name: string): string => {
  switch (name) {
    case '*':
      return '%2A';
    case '..':
      return '%2E%2E';
    case '.':
      return '%2E';
    case '@':
      return '%40';
    default:
      return escapeSegment(name);
  }
};
