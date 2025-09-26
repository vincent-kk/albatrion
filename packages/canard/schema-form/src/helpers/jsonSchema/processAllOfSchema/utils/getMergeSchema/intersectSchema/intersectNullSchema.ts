import type { NullSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';

/**
 * Intersects two null schema objects, merging their constraints and properties.
 *
 * This function handles the intersection of null-specific schema properties including:
 * - Enum value intersections (null values)
 * - Const value intersections
 * - Required field unions
 * - Metadata field handling (first-win and overwrite strategies)
 *
 * @param base - The base null schema to modify and return
 * @param source - The source null schema to intersect with base
 * @returns The modified base schema with intersected properties
 * @throws {JsonSchemaError} When enum intersections are empty or const values conflict
 */
export const intersectNullSchema = (
  base: NullSchema,
  source: Partial<NullSchema>,
): NullSchema => {
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
