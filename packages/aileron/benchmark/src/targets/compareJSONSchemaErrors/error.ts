import { Murmur3 } from '@winglet/common-utils';

import type { JSONSchemaError } from '@canard/schema-form';

export const serializeError = ({ dataPath, details = {} }: JSONSchemaError) =>
  `${dataPath}?${Object.entries(details)
    .map(([key, value]) => `${key}=${value?.toString?.() ?? ''}`)
    .join('&')}`;

export const serializeErrors = (errors: JSONSchemaError[]) =>
  errors.map(serializeError).join('|');

export const getErrorsHash = (errors: JSONSchemaError[]) =>
  new Murmur3(serializeErrors(errors)).result();
