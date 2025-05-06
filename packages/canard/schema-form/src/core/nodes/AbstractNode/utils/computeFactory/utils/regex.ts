import { JSONPath } from '@winglet/common-utils';

export const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
