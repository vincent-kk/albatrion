import { JSONPointer } from '../../enum';

export const TILDE = '~';
export const ESCAPE_TILDE = '~0';

export const ESCAPE_CHILD = '~1';
export const ESCAPE_PARENT = '~2';
export const ESCAPE_CURRENT = '~3';
export const ESCAPE_INDEX = '~4';
export const ESCAPE_ROOT = '~5';

export const UNESCAPE_MAP = {
  '0': TILDE,
  '1': JSONPointer.Child,
  '2': JSONPointer.Parent,
  '3': JSONPointer.Current,
  '4': JSONPointer.Index,
  '5': JSONPointer.Root,
} as const;
export type UNESCAPE_MAP = typeof UNESCAPE_MAP;
