import { JSONPath } from '@winglet/json-schema';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

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
