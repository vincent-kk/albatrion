import { isArray } from '@winglet/common-utils/filter';

import type { JsonSchema } from '@/schema-form/types';

export const distributeSubSchema = <Schema extends JsonSchema>(
  base: Schema,
  source: Partial<JsonSchema>,
) => {
  if (isArray(base.allOf)) base.allOf.push(source);
  else base.allOf = [source];
};
