import { JSONPointer } from './JSONPointer';

/** Two-character pointer prefixes, each a `JSONPointer` symbol followed by the separator. */
export const JSONPointerPrefix = {
  /** URI fragment root followed by a separator (`#/`). */
  Fragment: `${JSONPointer.Fragment}${JSONPointer.Separator}`,
  /** Parent step followed by a separator (`../`). */
  Parent: `${JSONPointer.Parent}${JSONPointer.Separator}`,
  /** Current step followed by a separator (`./`). */
  Current: `${JSONPointer.Current}${JSONPointer.Separator}`,
} as const;
