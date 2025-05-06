import { isTruthy, map, merge } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const mergeShowConditions = (
  jsonSchema: JsonSchemaWithVirtual,
  conditions: string[] | undefined,
) =>
  conditions
    ? merge(jsonSchema, {
        computed: {
          visible: combineConditions(
            [
              jsonSchema.computed?.visible,
              combineConditions(conditions || [], '||'),
            ],
            '&&',
          ),
        },
      })
    : jsonSchema;

const combineConditions = (
  conditions: (string | boolean | undefined)[],
  operator: string,
) => {
  const filtered = conditions.filter(isTruthy);
  if (filtered.length === 1) return filtered[0];
  return map(filtered, (item) => `(${item})`).join(`${operator}`);
};
