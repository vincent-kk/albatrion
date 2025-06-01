import { JSONPath } from '@winglet/json';

/**
 * Regular expression for finding JSON path format
 * @example Finds patterns like '$.property', '_.property', '@.property'
 */
export const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Parent}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
