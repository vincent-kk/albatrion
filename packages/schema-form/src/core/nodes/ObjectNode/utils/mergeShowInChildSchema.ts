import { isTruthy, merge } from '@winglet/common-utils';

import type { JsonSchema } from '@/schema-form/types';

export const mergeShowConditions = (
  jsonSchema: JsonSchema,
  conditions: string[] | undefined,
) =>
  conditions
    ? merge(jsonSchema, {
        renderOptions: {
          visible: combineConditions(
            [
              jsonSchema.renderOptions?.visible,
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
  if (filtered.length === 1) {
    return filtered[0];
  }
  return filtered.map((item) => `(${item})`).join(`${operator}`);
};
