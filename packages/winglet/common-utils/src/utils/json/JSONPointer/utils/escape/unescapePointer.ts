import { CHILD, ESCAPE_CHILD, ESCAPE_TILDE, TILDE } from './constant';

const ESCAPE_PATTERN = /~[01]/g;

export const unescapePointer = (path: string) => {
  if (path.includes(TILDE)) return path.replace(ESCAPE_PATTERN, replaceEscape);
  else return path;
};

const replaceEscape = (segment: string) => {
  if (segment === ESCAPE_TILDE) return TILDE;
  if (segment === ESCAPE_CHILD) return CHILD;
  return segment;
};
