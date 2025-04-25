import { JSONPointer, TILDE } from '../enum';
import { JSONPointerError } from './error';

export const unescape = (path: string) => {
  if (path.includes(TILDE)) return path.replace(ESCAPE_PATTERN, replaceEscape);
  else return path;
};

const ESCAPE_PATTERN = /~[\d]/g;

const replaceEscape = (segment: string) => {
  if (segment === '~0') return TILDE;
  if (segment === '~1') return JSONPointer.Child;
  throw new JSONPointerError(
    'INVALID_TILDE_ESCAPE',
    `Invalid tilde escape: ${segment}`,
    { segment },
  );
};
