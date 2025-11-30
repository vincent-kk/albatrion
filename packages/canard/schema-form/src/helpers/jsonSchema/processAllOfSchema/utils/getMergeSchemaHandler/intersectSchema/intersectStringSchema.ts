import type { StringSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { intersectPattern } from './utils/intersectPattern';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { processSchemaType } from './utils/processSchemaType';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

/**
 * Intersects two string schema objects, merging their constraints and properties.
 *
 * This function performs a complete intersection of string-specific schema properties including:
 * - Length constraints (minLength, maxLength)
 * - Pattern matching (regex patterns combined with AND logic)
 * - Enum and const value intersections
 * - Required field unions
 * - Validation of constraint consistency
 *
 * @param base - The base string schema to modify and return
 * @param source - The source string schema to intersect with base
 * @returns The modified base schema with intersected properties
 * @throws {JsonSchemaError} When constraints create invalid ranges or conflicting values
 */
export const intersectStringSchema = (
  base: StringSchema,
  source: Partial<StringSchema>,
): StringSchema => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);

  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const pattern = intersectPattern(base.pattern, source.pattern);
  const minLength = intersectMinimum(base.minLength, source.minLength);
  const maxLength = intersectMaximum(base.maxLength, source.maxLength);

  validateRange(minLength, maxLength, 'Invalid string constraints: minLength');

  if (enumResult !== undefined) base.enum = enumResult;
  if (constResult !== undefined) base.const = constResult;
  if (requiredResult !== undefined) base.required = requiredResult;
  if (pattern !== undefined) base.pattern = pattern;
  if (minLength !== undefined) base.minLength = minLength;
  if (maxLength !== undefined) base.maxLength = maxLength;

  return base;
};
