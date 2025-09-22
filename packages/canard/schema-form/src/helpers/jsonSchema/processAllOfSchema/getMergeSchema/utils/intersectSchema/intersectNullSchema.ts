import type { NullSchema } from '@/schema-form/types';

import { intersectConst } from './utils/intersectConst';
import { intersectEnum } from './utils/intersectEnum';
import { processFirstWinFields } from './utils/processFirstWinFields';
import { processOverwriteFields } from './utils/processOverwriteFields';
import { unionRequired } from './utils/unionRequired';

export const intersectNullSchema = (
  base: NullSchema,
  source: Partial<NullSchema>,
): NullSchema => {
  const firstWinFields = processFirstWinFields(base, source);

  const overwriteFields = processOverwriteFields(base, source);

  const enumResult = intersectEnum(base.enum, source.enum);
  const constResult = intersectConst(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);

  const result = {
    type: 'null',
    ...overwriteFields,
    ...firstWinFields,
  } as NullSchema;

  if (enumResult !== undefined) result.enum = enumResult;
  if (constResult !== undefined) result.const = constResult;
  if (requiredResult !== undefined) result.required = requiredResult;

  return result;
};
