import { escapeSegment } from '@winglet/json/pointer-escape';

/** Encode a literal name without interpreting ordinary percent-containing names. */
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
