import type { JsonSchemaError } from '@canard/schema-form';

export const formatError = (error: JsonSchemaError) => {
  return error.message;
};
