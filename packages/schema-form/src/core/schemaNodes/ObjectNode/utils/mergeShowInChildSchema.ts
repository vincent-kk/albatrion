import { isTruthy } from '@lumy/schema-form/helpers/filter';
import type { JsonSchema } from '@lumy/schema-form/types';
import { merge } from 'es-toolkit';

export const mergeShowConditions = (
  jsonSchema: JsonSchema,
  invertedAnyOfConditions: string[] | undefined,
) =>
  invertedAnyOfConditions
    ? merge(jsonSchema, {
        ui: {
          show: combineConditions(
            [
              jsonSchema.ui?.show,
              combineConditions(invertedAnyOfConditions || [], '||'),
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
