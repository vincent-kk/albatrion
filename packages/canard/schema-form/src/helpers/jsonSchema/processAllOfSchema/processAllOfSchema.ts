import { cloneLite } from '@winglet/common-utils/object';

import { JsonSchemaError, SchemaFormError } from '@/schema-form/errors';
import {
  formatAllOfIgnoredKeywordError,
  formatAllOfTypeRedefinitionError,
} from '@/schema-form/helpers/error';
import { warnDevelopmentIssue } from '@/schema-form/helpers/warning';
import type { JsonSchema } from '@/schema-form/types';

import { getCloneDepth } from './utils/getCloneDepth';
import {
  IGNORE_FIELDS,
  getMergeSchemaHandler,
} from './utils/getMergeSchemaHandler';
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
    for (let j = 0, jl = IGNORE_FIELDS.length; j < jl; j++)
      if (IGNORE_FIELDS[j] in allOfSchema)
        warnDevelopmentIssue(
          new SchemaFormError(
            'ALL_OF_UNSUPPORTED_KEYWORD',
            formatAllOfIgnoredKeywordError(IGNORE_FIELDS[j]),
            { keyword: IGNORE_FIELDS[j], allOfSchema },
          ),
        );
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
