import { cloneLite } from '@winglet/common-utils/object';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchema } from '@/schema-form/types';

import { getLimit } from './utils/getLimit';
import { getMergeSchema } from './utils/getMergeSchema';
import { validateCompatibility } from './utils/validateCompatibility';

/**
 * Processes a JSON Schema containing an `allOf` property by merging all schemas in the array
 * into a single unified schema. Validates type compatibility and throws errors for incompatible types.
 *
 * @param schema - The JSON Schema to process that may contain an `allOf` property
 * @returns The processed schema with all `allOf` schemas merged into the base schema
 * @throws {JsonSchemaError} When allOf schema contains incompatible type redefinitions
 */
export const processAllOfSchema = (schema: JsonSchema): JsonSchema => {
  if (!schema.allOf?.length) return schema;
  const mergeSchema = getMergeSchema(schema);
  if (!mergeSchema) return schema;

  const type = schema.type;
  const { allOf, ...rest } = schema;
  schema = cloneLite(rest, getLimit(schema));
  for (let i = 0, l = allOf!.length; i < l; i++) {
    const allOfSchema = allOf![i];
    if (validateCompatibility(type, allOfSchema.type) === false)
      throw new JsonSchemaError(
        'ALL_OF_TYPE_REDEFINITION',
        'Type cannot be redefined in allOf schema. It must either be omitted or match the parent schema type.',
        { schema, allOfSchema },
      );

    schema = mergeSchema(schema, allOfSchema);
  }
  return schema;
};
