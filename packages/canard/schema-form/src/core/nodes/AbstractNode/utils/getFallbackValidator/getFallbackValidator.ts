import { JSONPath } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Creates a fallback validator to use when a JSON schema compilation error occurs.
 * Returns an error containing failure information at runtime.
 * @param error - Original compilation error
 * @param jsonSchema - Original JSON schema
 * @returns Fallback validator function
 */
export const getFallbackValidator = (
  error: Error,
  jsonSchema: JsonSchemaWithVirtual,
) =>
  Object.assign(
    (_: unknown): _ is unknown => {
      throw {
        errors: [
          {
            keyword: 'jsonSchemaCompileFailed',
            instancePath: JSONPath.Root,
            message: error.message,
            params: {
              error,
            },
          },
        ],
      };
    },
    {
      errors: null,
      schema: jsonSchema,
      schemaEnv: {} as any,
    },
  );
