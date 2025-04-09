import { generateHash } from '@winglet/common-utils';

import type { JsonSchemaError } from '@/schema-form/types';

/**
 * @description JsonSchemaError의 schemaPath와 params를 문자열로 변환하여 해싱
 * @param errors - JsonSchemaError 배열
 * @returns Number by Murmur3
 */
export const getErrorsHash = (errors: JsonSchemaError[]) =>
  generateHash(serializeErrors(errors));

const serializeError = ({ schemaPath, params = {} }: JsonSchemaError) => {
  const paramsEntries = Object.entries(params);
  const serializedParams = new Array<string>(paramsEntries.length);
  for (let i = 0; i < paramsEntries.length; i++) {
    const [key, value] = paramsEntries[i];
    serializedParams[i] = `${key}=${value?.toString?.() || ''}`;
  }
  return `${schemaPath}?${serializedParams.join('&')}`;
};

const serializeErrors = (errors: JsonSchemaError[]) => {
  const serializedErrors = new Array<string>(errors.length);
  for (let i = 0; i < errors.length; i++)
    serializedErrors[i] = serializeError(errors[i]);
  return serializedErrors.join('|');
};
