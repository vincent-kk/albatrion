import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';
import type {
  JSONSchemaError,
  JSONSchemaWithVirtual,
} from '@/schema-form/types';

/**
 * Creates a fallback validator to use when a JSON schema compilation error occurs.
 * Returns an error containing failure information at runtime.
 * @param error - Original compilation error
 * @param jsonSchema - Original JSON schema
 * @returns Fallback validator function
 */
export const getFallbackValidator =
  (error: Error, jsonSchema: JSONSchemaWithVirtual) => () =>
    [
      {
        keyword: 'jsonSchemaCompileFailed',
        dataPath: $.Separator,
        message: error.message,
        source: error,
        details: {
          jsonSchema,
        },
      },
    ] satisfies JSONSchemaError[];
