import type { JsonSchema } from '@lumy/schema-form/types';

export const getFallbackValue = <Schema extends JsonSchema>(
  jsonSchema: Schema,
) =>
  jsonSchema.default ??
  (jsonSchema.type === 'object'
    ? {}
    : jsonSchema.type === 'array'
      ? []
      : undefined);
