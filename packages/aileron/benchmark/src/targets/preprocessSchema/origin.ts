import type { Dictionary } from '@aileron/declare';

const transformRequiredWithVirtual = (
  required: string[] | undefined,
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  if (!required) return { required: [], virtualRequired: [] };

  const newRequired: string[] = [];
  const virtualRequired: string[] = [];

  for (const key of required) {
    if (virtual[key]) {

      newRequired.push(...virtual[key].fields);
      virtualRequired.push(key);
    } else {

      newRequired.push(key);
    }
  }

  return { required: newRequired, virtualRequired };
};

export const transformConditionalSchema = (
  schema: any,
  virtual: Dictionary<{ fields: string[] }>,
): any => {
  if (!schema || typeof schema !== 'object') return schema;

  const transformed = { ...schema };


  if (schema.required && Array.isArray(schema.required)) {
    const { required: newRequired, virtualRequired } =
      transformRequiredWithVirtual(schema.required, virtual);

    transformed.required = newRequired;


    if (virtualRequired.length > 0) {
      transformed.virtual = virtualRequired;
    }
  }


  if (schema.then) {
    transformed.then = transformConditionalSchema(schema.then, virtual);
  }

  if (schema.else) {
    transformed.else = transformConditionalSchema(schema.else, virtual);
  }

  return transformed;
};
