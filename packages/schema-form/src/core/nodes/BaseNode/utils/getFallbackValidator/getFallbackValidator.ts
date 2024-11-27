import { JSONPath, type JsonSchema } from '@lumy/schema-form/types';

export const getFallbackValidator = (error: Error, jsonSchema: JsonSchema) =>
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
