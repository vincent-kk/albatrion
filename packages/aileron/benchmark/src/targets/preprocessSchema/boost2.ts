import type { Dictionary } from '@aileron/declare';

import type { JSONSchema } from '@/json-schema';

export const transformConditionalSchema = (
  schema: Partial<JSONSchema>,
  virtual: Dictionary<{ fields: string[] }>,
): Partial<JSONSchema> => {

  const transformed: Partial<JSONSchema> = {};


  Object.assign(transformed, schema);


  if (schema.required?.length) {
    const result = transformRequiredWithVirtual(schema.required, virtual);
    transformed.required = result.required;
    if (result.virtualRequired.length)
      transformed.virtual = result.virtualRequired;
  }


  if (schema.then) {
    transformed.then = transformConditionalSchema(schema.then, virtual);
  }

  if (schema.else) {
    transformed.else = transformConditionalSchema(schema.else, virtual);
  }

  return transformed;
};

const transformRequiredWithVirtual = (
  required: string[],
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  const newRequired: string[] = [];
  const virtualRequired: string[] = [];


  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    const vEntry = virtual[key];

    if (vEntry) {

      newRequired.push(...vEntry.fields);
      virtualRequired.push(key);
    } else {
      newRequired.push(key);
    }
  }

  return { required: newRequired, virtualRequired };
};
