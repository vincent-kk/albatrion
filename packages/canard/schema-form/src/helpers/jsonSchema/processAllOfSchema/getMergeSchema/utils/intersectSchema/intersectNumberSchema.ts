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
  const firstWinFields = processFirstWinFields(base, source);

  const overwriteFields = processOverwriteFields(base, source);

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

  const result = {
    type: base.type,
    ...overwriteFields,
    ...firstWinFields,
  } as NumberSchema;

  if (enumResult !== undefined) result.enum = enumResult;
  if (constResult !== undefined) result.const = constResult;
  if (requiredResult !== undefined) result.required = requiredResult;
  if (minimum !== undefined) result.minimum = minimum;
  if (maximum !== undefined) result.maximum = maximum;
  if (exclusiveMinimum !== undefined)
    result.exclusiveMinimum = exclusiveMinimum;
  if (exclusiveMaximum !== undefined)
    result.exclusiveMaximum = exclusiveMaximum;
  if (multipleOf !== undefined) result.multipleOf = multipleOf;

  return result;
};
