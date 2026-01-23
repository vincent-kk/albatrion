import {
  type JsonScannerOptions,
  JsonSchemaScanner,
} from '@winglet/json-schema/scanner';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

export const stripSchemaExtensions = (
  jsonSchema: JsonSchemaWithVirtual,
): JsonSchema =>
  new JsonSchemaScanner({ options: { mutate } }).scan(jsonSchema).getValue() ||
  (jsonSchema as JsonSchema);

const mutate: JsonScannerOptions<JsonSchemaWithVirtual>['mutate'] = ({
  schema,
}) => {
  if (schema == null) return;
  if (
    schema.FormTypeInput === undefined &&
    schema.FormTypeInputProps === undefined &&
    schema.FormTypeRendererProps === undefined &&
    schema.errorMessages === undefined &&
    schema.options === undefined &&
    schema.injectValueTo === undefined
  )
    return;
  const {
    FormTypeInput,
    FormTypeInputProps,
    FormTypeRendererProps,
    errorMessages,
    options,
    injectValueTo,
    ...stripedSchema
  } = schema;
  return stripedSchema;
};
