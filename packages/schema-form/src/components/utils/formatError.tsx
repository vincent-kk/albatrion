import type { JsonSchemaError } from '@lumy-form/types';

export const formatError = (error: JsonSchemaError) => {
  return <em>{error.message}</em>;
};
