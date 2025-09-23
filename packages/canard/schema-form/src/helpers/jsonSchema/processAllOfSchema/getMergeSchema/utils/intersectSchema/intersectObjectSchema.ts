import type { ObjectSchema, StringSchema } from '@/schema-form/types';

import { intersectStringSchema } from './intersectStringSchema';
import { distributeSubSchema } from './utils/distributeSubSchema';
import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

export const intersectObjectSchema = (
  base: ObjectSchema,
  source: Partial<ObjectSchema>,
): ObjectSchema => {
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);

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

  if (source.properties !== undefined)
    if (base.properties === undefined) base.properties = source.properties;
    else {
      const properties = base.properties;
      const sourceProperties = Object.entries(source.properties);
      for (let i = 0, l = sourceProperties.length; i < l; i++) {
        const [key, value] = sourceProperties[i];
        if (properties[key] === undefined) properties[key] = value;
        else distributeSubSchema(properties[key], value);
      }
    }
  return base;
};
