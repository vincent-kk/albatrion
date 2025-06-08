import type { JsonSchemaError } from '@/schema-form/types';

export const formatError = (error: JsonSchemaError) => error.message;
