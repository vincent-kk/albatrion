import { cloneLite } from '@winglet/common-utils/object';

import { JsonSchemaError } from '@/schema-form/errors';
import { formatAllOfTypeRedefinitionError } from '@/schema-form/helpers/error';
import type { JsonSchema } from '@/schema-form/types';

import { getCloneDepth } from './utils/getCloneDepth';
import { getMergeSchemaHandler } from './utils/getMergeSchemaHandler';
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
  const mergeHandler = getMergeSchemaHandler(schema);
  if (!mergeHandler) return schema;

  const { allOf, ...rest } = schema;
  schema = cloneLite(rest, getCloneDepth(schema));
  for (let i = 0, l = allOf!.length; i < l; i++) {
    const allOfSchema = allOf![i];
    if (validateCompatibility(schema, allOfSchema) === false)
      throw new JsonSchemaError(
        'ALL_OF_TYPE_REDEFINITION',
        formatAllOfTypeRedefinitionError(schema, allOfSchema),
        { schema, allOfSchema },
      );

    schema = mergeHandler(schema, allOfSchema);
  }
  return schema;
};
