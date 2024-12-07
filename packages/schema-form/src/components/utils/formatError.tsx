import type { JsonSchemaError } from '@/schema-form/types';

export const formatError = (error: JsonSchemaError) => {
  return <em>{error.message}</em>;
};
