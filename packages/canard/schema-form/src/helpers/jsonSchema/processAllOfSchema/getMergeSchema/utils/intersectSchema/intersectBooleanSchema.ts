import type { BooleanSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';

export const intersectBooleanSchema = (
  base: BooleanSchema,
  source: Partial<BooleanSchema>,
): BooleanSchema => {
  const firstWinFields = processFirstWinFields(base, source);
  const overwriteFields = processOverwriteFields(base, source);

  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);

  const result = {
    type: 'boolean',
    ...overwriteFields,
    ...firstWinFields,
  } as BooleanSchema;

  if (enumResult !== undefined) result.enum = enumResult;
  if (constResult !== undefined) result.const = constResult;
  if (requiredResult !== undefined) result.required = requiredResult;

  return result;
};
