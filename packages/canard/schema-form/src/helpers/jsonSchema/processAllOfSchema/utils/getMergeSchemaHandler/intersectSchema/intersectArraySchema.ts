import type { ArraySchema } from '@/schema-form/types';

import { distributeAllOfItems } from './utils/distributeSubSchema';
import { intersectBooleanOr } from './utils/intersectBooleanOr';
import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { processSchemaType } from './utils/processSchemaType';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

/**
 * Intersects two array schema objects, merging their constraints and properties.
 *
 * This function performs a complete intersection of array-specific schema properties including:
 * - Item count constraints (minItems, maxItems)
 * - Contains constraints (minContains, maxContains)
 * - Unique items requirement (boolean OR operation)
 * - Enum and const value intersections (with deep equality)
 * - Item schema distribution through allOf
 * - Required field unions
 * - Validation of constraint consistency
 *
 * @param base - The base array schema to modify and return
 * @param source - The source array schema to intersect with base
 * @returns The modified base schema with intersected properties
 * @throws {JsonSchemaError} When constraints create invalid ranges or conflicting values
 */
export const intersectArraySchema = (
  base: ArraySchema,
  source: Partial<ArraySchema>,
): ArraySchema => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  distributeAllOfItems(base, source);

  const enumResult = intersectEnum(base.enum, source.enum, true);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const minItems = intersectMinimum(base.minItems, source.minItems);
  const maxItems = intersectMaximum(base.maxItems, source.maxItems);
  const minContains = intersectMinimum(base.minContains, source.minContains);
  const maxContains = intersectMaximum(base.maxContains, source.maxContains);
  const uniqueItems = intersectBooleanOr(base.uniqueItems, source.uniqueItems);

  validateRange(minItems, maxItems, 'Invalid array constraints: minItems');
  validateRange(
    minContains,
    maxContains,
    'Invalid array constraints: minContains',
  );

  if (enumResult !== undefined) base.enum = enumResult;
  if (constResult !== undefined) base.const = constResult;
  if (requiredResult !== undefined) base.required = requiredResult;
  if (minItems !== undefined) base.minItems = minItems;
  if (maxItems !== undefined) base.maxItems = maxItems;
  if (minContains !== undefined) base.minContains = minContains;
  if (maxContains !== undefined) base.maxContains = maxContains;
  if (uniqueItems !== undefined) base.uniqueItems = uniqueItems;

  return base;
};
