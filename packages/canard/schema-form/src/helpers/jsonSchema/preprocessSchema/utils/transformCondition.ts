import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

export const transformCondition = (
  schema: Partial<JsonSchema>,
  virtual: Dictionary<{ fields: string[] }>,
): Partial<JsonSchema> => {
  const transformed: Partial<JsonSchema> = Object.assign({}, schema);
  if (schema.required?.length) {
    const result = transformVirtualFields(schema.required, virtual);
    transformed.required = result.required;
    result.virtualKeys.length && (transformed.virtualKeys = result.virtualKeys);
  }
  schema.then && (transformed.then = transformCondition(schema.then, virtual));
  schema.else && (transformed.else = transformCondition(schema.else, virtual));
  return transformed;
};

const transformVirtualFields = (
  required: string[],
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualKeys: string[] } => {
  const requiredKeys: string[] = [];
  const virtualKeys: string[] = [];
  for (let i = 0, len = required.length; i < len; i++) {
    const key = required[i];
    const fields = virtual[key]?.fields;
    if (fields) {
      for (let j = 0, l = fields.length; j < l; j++)
        requiredKeys.push(fields[j]);
      virtualKeys.push(key);
    } else requiredKeys.push(key);
  }
  return { required: requiredKeys, virtualKeys };
};
