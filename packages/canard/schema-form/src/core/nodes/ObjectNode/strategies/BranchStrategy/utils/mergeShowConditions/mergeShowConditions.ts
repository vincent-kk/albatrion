import { merge } from '@winglet/common-utils/object';

import { combineConditions } from '@/schema-form/helpers/dynamicExpression';
import type { JsonSchemaWithRef } from '@/schema-form/types';

/**
 * Merges JSON schema with conditions and returns a new schema.
 * @param jsonSchema - Original JSON schema
 * @param conditions - List of conditions to process
 * @returns New schema with conditions applied, or original schema if no conditions exist
 */
export const mergeShowConditions = (
  jsonSchema: JsonSchemaWithRef,
  conditions: string[] | undefined,
) => {
  if (conditions) {
    const active: string | boolean | undefined =
      jsonSchema.computed?.active ?? jsonSchema['&active'];
    if (typeof active === 'boolean') return jsonSchema;
    return merge(jsonSchema, {
      computed: {
        active: combineConditions(
          [active, combineConditions(conditions, '||')],
          '&&',
        ),
      },
    });
  } else return jsonSchema;
};
