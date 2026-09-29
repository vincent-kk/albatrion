import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';

import type { ArraySchema } from '@/schema-form/types';

interface ArrayLimits {
  readonly min: number;
  readonly max: number;
}

/**
 * Resolves the effective minItems and maxItems constraints for an array schema.
 *
 * JSON Schema array constraints:
 * - `minItems`: Minimum number of items (default: 0)
 * - `maxItems`: Maximum number of items (default: Infinity)
 * - Tuple constraint: When `items` is absent and `prefixItems` exists,
 *   the array is a closed tuple and cannot exceed `prefixItems.length`.
 *
 * @see https://json-schema.org/understanding-json-schema/reference/array
 *
 * @param jsonSchema - The JSON Schema to resolve limits from
 * @returns ArrayLimits with resolved minItems and maxItems
 *
 * @example
 * // Standard array
 * resolveArrayLimits({ type: 'array', minItems: 1, maxItems: 10 })
 * // → { minItems: 1, maxItems: 10 }
 *
 * @example
 * // Open tuple (items allows additional elements)
 * resolveArrayLimits({
 *   type: 'array',
 *   prefixItems: [{ type: 'string' }, { type: 'number' }],
 *   items: { type: 'boolean' }
 * })
 * // → { minItems: 0, maxItems: Infinity }
 *
 * @example
 * // Closed tuple (no items, only prefixItems)
 * resolveArrayLimits({
 *   type: 'array',
 *   prefixItems: [{ type: 'string' }, { type: 'number' }]
 * })
 * // → { minItems: 0, maxItems: 2 }
 */
export const resolveArrayLimits = (jsonSchema: ArraySchema): ArrayLimits => {
  const minItems = jsonSchema.minItems ?? 0;
  const explicitMax = jsonSchema.maxItems ?? Infinity;

  // Tuple constraint: no `items` + has `prefixItems` → closed tuple
  const tupleLimit =
    !jsonSchema.items && isArray(jsonSchema.prefixItems)
      ? jsonSchema.prefixItems.length
      : Infinity;

  return {
    min: minItems,
    max: minLite(explicitMax, tupleLimit),
  } as const;
};
