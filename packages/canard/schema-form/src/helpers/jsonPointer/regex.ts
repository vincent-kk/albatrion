import { JSONPointer } from './enum';

/**
 * Regular expression for finding JSON path format
 * @example Finds patterns like './property', '../property', '#/property', '/property'
 */
export const JSON_POINTER_REGEX = new RegExp(
  `(?<![a-zA-Z0-9_])(\\${JSONPointer.Fragment}|\\${JSONPointer.Parent}|\\${JSONPointer.Current})?\\${JSONPointer.Separator}([a-zA-Z0-9]+(\\${JSONPointer.Separator}[a-zA-Z0-9]+)*)?`,
  'g',
);

/**
 * Regular expression for finding JSON path format with index patterns
 * Finds valid JSON Pointer paths that contain * as standalone segments
 * @example Matches '#/property/*' or '/property/*'
 */
export const INCLUDE_INDEX_REGEX = new RegExp(
  `^(\\${JSONPointer.Fragment})?\\${JSONPointer.Separator}(?:.*\\${JSONPointer.Separator})?\\${JSONPointer.Index}(?:\\${JSONPointer.Separator}.*)?(?<!\\${JSONPointer.Separator})$`,
);
