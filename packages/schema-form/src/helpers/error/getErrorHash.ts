import { generateHash } from '@lumy-pack/common';

import type { JsonSchemaError } from '@/schema-form/types';

/**
 * @description JsonSchemaError의 schemaPath와 params를 문자열로 변환하여 해싱
 * @param errors - JsonSchemaError 배열
 * @returns Number by Murmur3
 */
export const getErrorsHash = (errors: JsonSchemaError[]) =>
  generateHash(serializeErrors(errors));

const serializeError = ({ schemaPath, params = {} }: JsonSchemaError) =>
  `${schemaPath}?${Object.entries(params)
    .map(([key, value]) => `${key}=${value?.toString?.() || ''}`)
    .join('&')}`;

const serializeErrors = (errors: JsonSchemaError[]) =>
  errors.map(serializeError).join('|');
