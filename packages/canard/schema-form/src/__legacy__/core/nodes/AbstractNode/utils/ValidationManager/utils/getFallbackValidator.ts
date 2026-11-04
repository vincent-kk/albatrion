import type {
  JSONSchemaError,
  JSONSchemaWithVirtual,
} from '@/schema-form/__legacy__/types';

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
        dataPath: '',
        message: error.message,
        source: error,
        details: {
          jsonSchema,
        },
      },
    ] satisfies JSONSchemaError[];
