import type { JsonSchemaError } from '@lumy/schema-form/types';

export const formatError = (error: JsonSchemaError) => {
  return <em>{error.message}</em>;
};
