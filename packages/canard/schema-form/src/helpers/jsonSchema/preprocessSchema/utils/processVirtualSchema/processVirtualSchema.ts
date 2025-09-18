import type { JsonSchema } from '@/schema-form/types';

import { transformCondition } from './utils/transformCondition';

export const processVirtualSchema = (schema: Partial<JsonSchema>) => {
  if (schema.virtual === undefined) return null;
  let expired = false;
  if (schema.required) {
    schema = transformCondition(schema, schema.virtual);
    expired = true;
  }
  if (schema.then) {
    schema.then = transformCondition(schema.then, schema.virtual);
    expired = true;
  }
  if (schema.else) {
    schema.else = transformCondition(schema.else, schema.virtual);
    expired = true;
  }
  return expired ? schema : null;
};
