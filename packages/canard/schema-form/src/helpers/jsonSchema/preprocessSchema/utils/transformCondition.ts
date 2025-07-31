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
    result.virtualRequired.length &&
      (transformed.virtualRequired = result.virtualRequired);
  }
  schema.then && (transformed.then = transformCondition(schema.then, virtual));
  schema.else && (transformed.else = transformCondition(schema.else, virtual));
  return transformed;
};

const transformVirtualFields = (
  required: string[],
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  const requiredKeys: string[] = [];
  const virtualRequiredKeys: string[] = [];
  for (let i = 0, il = required.length; i < il; i++) {
    const key = required[i];
    const fields = virtual[key]?.fields;
    if (fields) {
      for (let j = 0, jl = fields.length; j < jl; j++)
        requiredKeys.indexOf(fields[j]) === -1 && requiredKeys.push(fields[j]);
      virtualRequiredKeys.indexOf(key) === -1 && virtualRequiredKeys.push(key);
    } else requiredKeys.indexOf(key) === -1 && requiredKeys.push(key);
  }
  return { required: requiredKeys, virtualRequired: virtualRequiredKeys };
};
