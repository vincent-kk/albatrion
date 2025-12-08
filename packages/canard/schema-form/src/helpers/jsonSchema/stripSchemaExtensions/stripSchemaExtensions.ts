import {
  type JsonScannerOptions,
  JsonSchemaScanner,
} from '@winglet/json-schema/scanner';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

export const stripSchemaExtensions = (
  jsonSchema: JsonSchemaWithVirtual,
): JsonSchema =>
  new JsonSchemaScanner({ options: { mutate } })
    .scan(jsonSchema)
    .getValue<JsonSchema>() || (jsonSchema as JsonSchema);

const mutate: JsonScannerOptions['mutate'] = ({ schema }) => {
  if (schema == null) return;
  if (
    schema.FormTypeInputProps === undefined &&
    schema.FormTypeRendererProps === undefined &&
    schema.errorMessages === undefined &&
    schema.options === undefined
  )
    return;
  const {
    FormTypeInputProps,
    FormTypeRendererProps,
    errorMessages,
    options,
    ...stripedSchema
  } = schema;
  return stripedSchema;
};
