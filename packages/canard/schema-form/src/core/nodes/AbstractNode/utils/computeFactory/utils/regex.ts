import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Regular expression for finding JSON path format
 * @example Finds patterns like './property', '../property', '#/property', '/property'
 */
export const JSON_POINTER_REGEX = new RegExp(
  `(?<=^|\\s)(\\${JSONPointer.Root}|\\${JSONPointer.Parent}|\\${JSONPointer.Current})?\\${JSONPointer.Child}([a-zA-Z0-9]+(\\${JSONPointer.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
