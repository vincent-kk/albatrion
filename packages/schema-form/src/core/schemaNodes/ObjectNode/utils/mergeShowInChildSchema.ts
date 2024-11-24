import { merge } from 'es-toolkit';

import { isTruthy } from '@lumy/schema-form/helpers/filter';
import type { JsonSchema } from '@lumy/schema-form/types';

export const mergeShowConditions = (
  jsonSchema: JsonSchema,
  conditions: string[] | undefined,
) =>
  conditions
    ? merge(jsonSchema, {
        ui: {
          show: combineConditions(
            [jsonSchema.ui?.show, combineConditions(conditions || [], '||')],
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
