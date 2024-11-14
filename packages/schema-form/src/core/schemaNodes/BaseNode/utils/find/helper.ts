import { JSONPath } from '@lumy/schema-form/types';

const START_DOT_PATTERN = /^\.([^.])/;
const ARRAY_PATTERN = /\[(\d+)\]/g;

export const getPathSegments = (path: string) =>
  path
    .replace(START_DOT_PATTERN, '$1')
    .replace(ARRAY_PATTERN, '.$1')
    .split(JSONPath.Child);
