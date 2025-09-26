import type { ObjectSchema, StringSchema } from '@/schema-form/types';

import { intersectStringSchema } from './intersectStringSchema';
import { distributeAllOfProperties } from './utils/distributeSubSchema';
import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

/**
 * Intersects two object schema objects, merging their constraints and properties.
 *
 * This function performs a complete intersection of object-specific schema properties including:
 * - Property count constraints (minProperties, maxProperties)
 * - Property name constraints (intersects string schemas for propertyNames)
 * - Enum and const value intersections (with deep equality)
 * - Property schema distribution through allOf
 * - Required field unions
 * - Validation of constraint consistency
 *
 * @param base - The base object schema to modify and return
 * @param source - The source object schema to intersect with base
 * @returns The modified base schema with intersected properties
 * @throws {JsonSchemaError} When constraints create invalid ranges or conflicting values
 */
export const intersectObjectSchema = (
  base: ObjectSchema,
  source: Partial<ObjectSchema>,
): ObjectSchema => {
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  distributeAllOfProperties(base, source);

  const enumResult = intersectEnum(base.enum, source.enum, true);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const propertyNames =
    base.propertyNames && source.propertyNames
      ? intersectStringSchema(
          base.propertyNames as StringSchema,
          source.propertyNames as StringSchema,
        )
      : base.propertyNames || source.propertyNames;
  const minProperties = intersectMinimum(
    base.minProperties,
    source.minProperties,
  );
  const maxProperties = intersectMaximum(
    base.maxProperties,
    source.maxProperties,
  );

  validateRange(
    minProperties,
    maxProperties,
    'Invalid object constraints: minProperties',
  );

  if (enumResult !== undefined) base.enum = enumResult;
  if (constResult !== undefined) base.const = constResult;
  if (requiredResult !== undefined) base.required = requiredResult;
  if (propertyNames !== undefined) base.propertyNames = propertyNames;
  if (minProperties !== undefined) base.minProperties = minProperties;
  if (maxProperties !== undefined) base.maxProperties = maxProperties;

  return base;
};
