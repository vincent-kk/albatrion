import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/json-schema';

export const transformConditionalSchema = (
  schema: Partial<JsonSchema>,
  virtual: Dictionary<{ fields: string[] }>,
): Partial<JsonSchema> => {
  const transformed: Partial<JsonSchema> = Object.assign({}, schema);
  if (schema.required?.length) {
    const result = transformRequiredWithVirtual(schema.required, virtual);
    transformed.required = result.required;
    result.virtualRequired.length &&
      (transformed.virtual = result.virtualRequired);
  }
  schema.then &&
    (transformed.then = transformConditionalSchema(schema.then, virtual));
  schema.else &&
    (transformed.else = transformConditionalSchema(schema.else, virtual));
  return transformed;
};

const transformRequiredWithVirtual = (
  required: string[],
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  const requiredKeys: string[] = [];
  const virtualRequired: string[] = [];
  for (let i = 0, len = required.length; i < len; i++) {
    const key = required[i];
    const fields = virtual[key]?.fields;
    if (fields) {
      for (let j = 0, l = fields.length; j < l; j++)
        requiredKeys.push(fields[j]);
      virtualRequired.push(key);
    } else requiredKeys.push(key);
  }
  return { required: requiredKeys, virtualRequired };
};
