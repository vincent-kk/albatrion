import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

/**
 * Transforms a schema condition by processing virtual field mappings in required arrays
 * and recursively applying transformations to nested then/else conditions.
 *
 * @param schema - The partial JSON Schema to transform
 * @param virtual - Dictionary mapping virtual field names to their constituent fields
 * @returns The transformed schema with virtual field mappings applied
 */
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

/**
 * Transforms required field arrays by expanding virtual fields into their constituent fields
 * and separating them into actual required fields and virtual required field tracking.
 *
 * @param required - Array of required field names that may include virtual fields
 * @param virtual - Dictionary mapping virtual field names to their constituent fields
 * @returns Object containing expanded required fields and virtual required field names
 */
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
