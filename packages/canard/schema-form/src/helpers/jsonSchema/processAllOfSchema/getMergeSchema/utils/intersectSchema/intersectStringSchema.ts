import type { StringSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { intersectMaximum } from './utils/intersectMaximum';
import { intersectMinimum } from './utils/intersectMinimum';
import { intersectPattern } from './utils/intersectPattern';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';
import { validateRange } from './utils/validateRange';

export const intersectStringSchema = (
  base: StringSchema,
  source: Partial<StringSchema>,
): StringSchema => {
  const firstWinFields = processFirstWinFields(base, source);
  const overwriteFields = processOverwriteFields(base, source);
  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);

  const pattern = intersectPattern(base.pattern, source.pattern);
  const minLength = intersectMinimum(base.minLength, source.minLength);
  const maxLength = intersectMaximum(base.maxLength, source.maxLength);

  validateRange(minLength, maxLength, 'Invalid string constraints: minLength');

  const result = {
    type: 'string',
    ...overwriteFields,
    ...firstWinFields,
  } as StringSchema;

  if (enumResult !== undefined) result.enum = enumResult;
  if (constResult !== undefined) result.const = constResult;
  if (requiredResult !== undefined) result.required = requiredResult;
  if (pattern !== undefined) result.pattern = pattern;
  if (minLength !== undefined) result.minLength = minLength;
  if (maxLength !== undefined) result.maxLength = maxLength;

  return result;
};
