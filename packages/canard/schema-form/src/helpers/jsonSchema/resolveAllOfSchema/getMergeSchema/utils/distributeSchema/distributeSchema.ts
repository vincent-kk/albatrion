import { isArray } from '@winglet/common-utils/filter';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchema } from '@/schema-form/types';

export const distributeSchema = <Schema extends JsonSchema>(
  base: Schema,
  source: Partial<JsonSchema>,
): Schema => {
  if (source.type !== undefined && base.type !== source.type)
    throw new JsonSchemaError(
      'ALL_OF_TYPE_REDEFINITION',
      'Type cannot be redefined in allOf schema. It must either be omitted or match the parent schema type.',
      {
        schema: base,
        allOfSchema: source,
      },
    );
  if (isArray(base.allOf)) base.allOf.push(source);
  else base.allOf = [source];
  return base;
};
