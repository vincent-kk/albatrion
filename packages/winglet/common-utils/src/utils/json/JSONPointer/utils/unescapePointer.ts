const TILDE = '~';
const CHILD = '/';

const ESCAPE_PATTERN = /~[01]/g;

export const unescapePointer = (path: string) => {
  if (path.includes(TILDE)) return path.replace(ESCAPE_PATTERN, replaceEscape);
  else return path;
};

const replaceEscape = (segment: string) => {
  if (segment === '~0') return TILDE;
  if (segment === '~1') return CHILD;
  return segment;
};
