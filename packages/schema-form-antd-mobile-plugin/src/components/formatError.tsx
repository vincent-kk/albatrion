import type { JsonSchemaError } from '@lumy-pack/schema-form';

export const formatError = (error: JsonSchemaError) => {
  return error.message;
};
