import { Murmur3 } from '@winglet/common-utils';

import type { JsonSchemaError } from '@canard/schema-form';

export const serializeError = ({ dataPath, details = {} }: JsonSchemaError) =>
  `${dataPath}?${Object.entries(details)
    .map(([key, value]) => `${key}=${value?.toString?.() ?? ''}`)
    .join('&')}`;

export const serializeErrors = (errors: JsonSchemaError[]) =>
  errors.map(serializeError).join('|');

export const getErrorsHash = (errors: JsonSchemaError[]) =>
  new Murmur3(serializeErrors(errors)).result();
