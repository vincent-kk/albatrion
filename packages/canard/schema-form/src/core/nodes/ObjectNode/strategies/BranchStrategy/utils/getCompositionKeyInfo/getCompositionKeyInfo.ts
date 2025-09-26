import type { ObjectSchema } from '@/schema-form/types';

type CompositionKeyInfo = {
  unionKeySet: Set<string>;
  schemaKeySets: Array<Set<string>>;
};

/**
 * Extract composition key information from oneOf or anyOf schema branches
 *
 * @param scope - Type of composition schema ('oneOf' or 'anyOf')
 * @param schema - Object schema containing composition definitions
 * @returns Composition key information containing union of all keys and individual branch key sets, or undefined if no composition schema exists
 */
export const getCompositionKeyInfo = (
  scope: 'oneOf' | 'anyOf',
  schema: ObjectSchema,
): CompositionKeyInfo | undefined => {
  if (!schema[scope]?.length) return undefined;
  const length = schema[scope].length;
  const unionKeySet = new Set<string>();
  const schemaKeySets = new Array<Set<string>>(length);
  for (let i = 0; i < length; i++) {
    const schemaProperties = schema[scope][i]
      ?.properties as ObjectSchema['properties'];
    if (schemaProperties === undefined) continue;
    const keys = Object.keys(schemaProperties);
    schemaKeySets[i] = new Set();
    for (let j = 0, k = keys[0], jl = keys.length; j < jl; j++, k = keys[j]) {
      const schema = schemaProperties[k];
      if (schema.type === undefined && schema.$ref === undefined) continue;
      unionKeySet.add(k);
      schemaKeySets[i].add(k);
    }
  }
  return { unionKeySet, schemaKeySets };
};
