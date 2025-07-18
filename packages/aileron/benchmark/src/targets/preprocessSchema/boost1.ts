import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/json-schema';

export const transformConditionalSchema = (
  schema: Partial<JsonSchema>,
  virtual: Dictionary<{ fields: string[] }>,
): Partial<JsonSchema> => {
  const transformed: Partial<JsonSchema> = { ...schema };

  const hasRequired = schema.required && Array.isArray(schema.required);
  const hasThen = schema.then !== undefined;
  const hasElse = schema.else !== undefined;

  if (hasRequired) {
    const { required: newRequired, virtualRequired } =
      transformRequiredWithVirtual(schema.required, virtual);
    transformed.required = newRequired;
    if (virtualRequired.length > 0) transformed.virtual = virtualRequired;
  }
  if (hasThen)
    transformed.then = schema.then
      ? transformConditionalSchema(schema.then, virtual)
      : schema.then;
  if (hasElse)
    transformed.else = schema.else
      ? transformConditionalSchema(schema.else, virtual)
      : schema.else;
  return transformed;
};

const transformRequiredWithVirtual = (
  required: string[] | undefined,
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  if (!required?.length) return { required: [], virtualRequired: [] };

  const requiredLength = required.length;
  const requiredKeys: string[] = [];
  const virtualRequired: string[] = [];

  let estimatedSize = 0;

  for (let i = 0; i < requiredLength; i++) {
    const virtualEntry = virtual[required[i]];
    estimatedSize += virtualEntry ? virtualEntry.fields.length : 1;
  }

  requiredKeys.length = estimatedSize;
  let newRequiredIndex = 0;

  for (let i = 0; i < requiredLength; i++) {
    const key = required[i];
    const virtualEntry = virtual[key];
    if (virtualEntry) {
      const fields = virtualEntry.fields;
      const fieldsLength = fields.length;
      for (let j = 0; j < fieldsLength; j++)
        requiredKeys[newRequiredIndex++] = fields[j];
      virtualRequired[virtualRequired.length] = key;
    } else requiredKeys[newRequiredIndex++] = key;
  }

  if (newRequiredIndex < estimatedSize) requiredKeys.length = newRequiredIndex;

  return { required: requiredKeys, virtualRequired };
};
