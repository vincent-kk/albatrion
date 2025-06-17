export type ClassObject = {
  [key: string]: boolean | undefined | null;
};

export type ClassArray = Array<ClassValue>;

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassArray
  | ClassObject;

export type ClassNamesOptions = {
  /** Remove duplicate classes @default true */
  removeDuplicates?: boolean;
  /** Normalize whitespace @default true */
  normalizeWhitespace?: boolean;
  /** Remove empty strings @default true */
  filterEmpty?: boolean;
};
