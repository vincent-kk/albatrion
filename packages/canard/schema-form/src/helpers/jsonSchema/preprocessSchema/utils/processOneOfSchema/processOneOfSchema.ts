import { merge } from '@winglet/common-utils/object';

import type { JsonSchema } from '@/schema-form/types';

export const processOneOfSchema = (
  schema: Partial<JsonSchema>,
  variant: number,
) =>
  merge(schema, {
    properties: {
      __oneOfIndex__: {
        const: variant,
      },
    },
  });
