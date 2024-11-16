import type { JsonSchema } from '@lumy/schema-form/types';
import { merge } from 'es-toolkit';

import { combineConditions } from './combineConditions';

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
