import type { JsonSchema } from '@/schema-form/types';

import { transformCondition } from './utils/transformCondition';

export const processVirtualSchema = (schema: Partial<JsonSchema>) => {
  if (schema.type !== 'object' || schema.virtual === undefined) return void 0;
  let processed = false;
  if (schema.required) {
    schema = transformCondition(schema, schema.virtual);
    processed = true;
  }
  if (schema.then) {
    schema.then = transformCondition(schema.then, schema.virtual);
    processed = true;
  }
  if (schema.else) {
    schema.else = transformCondition(schema.else, schema.virtual);
    processed = true;
  }
  return processed ? schema : void 0;
};
