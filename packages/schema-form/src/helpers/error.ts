import { Murmur3 } from '@lumy/common';
import { type JsonSchemaError } from '@lumy/schema-form/types';

export const filterErrors = (errors: JsonSchemaError[]) => errors;

export const serializeError = ({ schemaPath, params }: JsonSchemaError) =>
  `${schemaPath}?${Object.entries(params)
    .map(([key, value]) => `${key}=${value?.toString?.() ?? ''}`)
    .join('&')}`;

export const serializeErrors = (errors: JsonSchemaError[]) =>
  errors.map(serializeError).join('|');

export const getErrorsHash = (errors: JsonSchemaError[]) =>
  new Murmur3(serializeErrors(errors)).result();
