import { merge } from '@winglet/common-utils/object';

import { ENHANCED_KEY } from '@/schema-form/__legacy__/app/constants';
import type { JSONSchema } from '@/schema-form/__legacy__/types';

/**
 * Processes a oneOf schema by adding an enhanced key property that tracks the selected variant.
 * This allows the form system to know which oneOf option is currently active.
 *
 * @param schema - The partial JSON Schema to process
 * @param variant - The index of the selected oneOf variant
 * @returns The schema merged with an enhanced key property containing the variant index
 */
export const processOneOfSchema = (
  schema: Partial<JSONSchema>,
  variant: number,
) =>
  merge(schema, {
    properties: {
      [ENHANCED_KEY]: {
        const: variant,
      },
    },
  });
