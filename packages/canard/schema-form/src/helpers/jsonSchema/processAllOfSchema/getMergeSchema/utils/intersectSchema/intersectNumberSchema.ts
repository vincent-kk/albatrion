import type { NumberSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { intersectMultipleOf } from './utils/intersectMultipleOf';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

export const intersectNumberSchema = (
  base: NumberSchema,
  source: Partial<NumberSchema>,
): NumberSchema => {
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);

  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const minimum = intersectMinimum(base.minimum, source.minimum);
  const maximum = intersectMaximum(base.maximum, source.maximum);
  const exclusiveMinimum = intersectMinimum(
    base.exclusiveMinimum,
    source.exclusiveMinimum,
  );
  const exclusiveMaximum = intersectMaximum(
    base.exclusiveMaximum,
    source.exclusiveMaximum,
  );
  const multipleOf = intersectMultipleOf(base.multipleOf, source.multipleOf);

  validateRange(minimum, maximum, 'Invalid number constraints: minimum');
  validateRange(
    exclusiveMinimum,
    exclusiveMaximum,
    'Invalid number constraints: exclusiveMinimum',
  );

  if (enumResult !== undefined) base.enum = enumResult;
  if (constResult !== undefined) base.const = constResult;
  if (requiredResult !== undefined) base.required = requiredResult;
  if (minimum !== undefined) base.minimum = minimum;
  if (maximum !== undefined) base.maximum = maximum;
  if (exclusiveMinimum !== undefined) base.exclusiveMinimum = exclusiveMinimum;
  if (exclusiveMaximum !== undefined) base.exclusiveMaximum = exclusiveMaximum;
  if (multipleOf !== undefined) base.multipleOf = multipleOf;

  return base;
};
