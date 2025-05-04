import type { JsonSchemaError } from '@canard/schema-form';

export const formatError = (error: JsonSchemaError) => error.message;
