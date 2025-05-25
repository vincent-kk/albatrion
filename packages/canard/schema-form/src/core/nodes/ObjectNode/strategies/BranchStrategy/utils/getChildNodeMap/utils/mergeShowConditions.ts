import { isTruthy, map, merge } from '@winglet/common-utils';

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
) =>
  conditions
    ? merge(jsonSchema, {
        computed: {
          visible: combineConditions(
            [
              jsonSchema.computed?.visible ?? jsonSchema['&visible'],
              combineConditions(conditions || [], '||'),
            ],
            '&&',
          ),
        },
      })
    : jsonSchema;

/**
 * Function to combine multiple conditions with a specified operator.
 * @param conditions - Conditions to combine
 * @param operator - Operator to use ('&&' or '||')
 * @returns Combined condition expression
 */
const combineConditions = (
  conditions: (string | boolean | undefined)[],
  operator: string,
) => {
  const filtered = conditions.filter(isTruthy);
  if (filtered.length === 1) return filtered[0];
  return map(filtered, (item) => '(' + item + ')').join(operator);
};
