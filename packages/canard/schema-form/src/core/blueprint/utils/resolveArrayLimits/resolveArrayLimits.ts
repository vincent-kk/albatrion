import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';

import type { EffectiveSchema } from '../../type';

interface ArrayLimits {
  readonly min: number;
  readonly max: number;
}

/**
 * Read array length hints from a merged effective schema without enforcing them.
 * @param schema - Effective schema for the active array declarations
 * @returns Minimum and maximum item counts, including a closed tuple bound
 */
export const resolveArrayLimits = (
  schema: EffectiveSchema['schema'],
): ArrayLimits => {
  const minItems = typeof schema === 'object' ? schema.minItems : undefined;
  const maxItems = typeof schema === 'object' ? schema.maxItems : undefined;
  const prefixItems = typeof schema === 'object' ? schema.prefixItems : undefined;
  const items = typeof schema === 'object' ? schema.items : undefined;
  const tupleLimit = !items && isArray(prefixItems) ? prefixItems.length : Infinity;

  return {
    min: typeof minItems === 'number' ? minItems : 0,
    max: minLite(
      typeof maxItems === 'number' ? maxItems : Infinity,
      tupleLimit,
    ),
  };
};
