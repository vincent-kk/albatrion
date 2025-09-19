import { merge } from '@winglet/common-utils/object';

import { ENHANCED_KEY } from '@/schema-form/app/constants/internal';
import type { JsonSchema } from '@/schema-form/types';

export const processOneOfSchema = (
  schema: Partial<JsonSchema>,
  variant: number,
) =>
  merge(schema, {
    properties: {
      [ENHANCED_KEY]: {
        const: variant,
      },
    },
  });
