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

/**
 * Configuration options for class name processing.
 *
 * @example
 * ```typescript
 * const options: ClassNamesOptions = {
 *   removeDuplicates: true,    // 'btn btn btn-primary' → 'btn btn-primary'
 *   normalizeWhitespace: true, // 'btn   primary' → 'btn primary'
 *   filterEmpty: true          // ['btn', '', 'primary'] → 'btn primary'
 * };
 * ```
 */
export type ClassNamesOptions = {
  /** Remove duplicate classes @default true */
  removeDuplicates?: boolean;
  /** Normalize whitespace @default true */
  normalizeWhitespace?: boolean;
  /** Remove empty strings @default true */
  filterEmpty?: boolean;
};
