import { Murmur3 } from '@winglet/common-utils';

import { type JsonSchemaError } from '@canard/schema-form/src/types';

export const serializeError = ({ schemaPath, params = {} }: JsonSchemaError) =>
  `${schemaPath}?${Object.entries(params)
    .map(([key, value]) => `${key}=${value?.toString?.() ?? ''}`)
    .join('&')}`;

export const serializeErrors = (errors: JsonSchemaError[]) =>
  errors.map(serializeError).join('|');

export const getErrorsHash = (errors: JsonSchemaError[]) =>
  new Murmur3(serializeErrors(errors)).result();
