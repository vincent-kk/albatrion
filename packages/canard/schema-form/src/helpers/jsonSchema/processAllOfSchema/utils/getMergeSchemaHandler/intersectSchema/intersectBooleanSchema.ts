import type { BooleanSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { processSchemaType } from './utils/processSchemaType';
import { unionRequired } from './utils/unionRequired';

/**
 * Intersects two boolean schema objects, merging their constraints and properties.
 *
 * This function handles the intersection of boolean-specific schema properties including:
 * - Enum value intersections (boolean values)
 * - Const value intersections
 * - Required field unions
 * - Metadata field handling (first-win and overwrite strategies)
 *
 * @param base - The base boolean schema to modify and return
 * @param source - The source boolean schema to intersect with base
 * @returns The modified base schema with intersected properties
 * @throws {JsonSchemaError} When enum intersections are empty or const values conflict
 */
export const intersectBooleanSchema = (
  base: BooleanSchema,
  source: Partial<BooleanSchema>,
): BooleanSchema => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);

  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);

  if (enumResult !== undefined) base.enum = enumResult;
  if (constResult !== undefined) base.const = constResult;
  if (requiredResult !== undefined) base.required = requiredResult;

  return base;
};
