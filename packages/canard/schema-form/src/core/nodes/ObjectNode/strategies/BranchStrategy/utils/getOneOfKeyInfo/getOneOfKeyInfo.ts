import type { ObjectSchema } from '@/schema-form/types';

/**
 * Type representing oneOf key information
 */
type OneOfKeyInfo = {
  oneOfKeySet: Set<string>;
  oneOfKeySetList: Array<Set<string>>;
};

/**
 * Extracts oneOf key information from an object schema.
 * @param schema - Object JSON schema
 * @returns oneOf key information or undefined if no oneOf exists
 */
export const getOneOfKeyInfo = (
  schema: ObjectSchema,
): OneOfKeyInfo | undefined => {
  if (!schema.oneOf?.length) return undefined;
  const length = schema.oneOf.length;
  const oneOfKeySet = new Set<string>();
  const oneOfKeySetList = new Array<Set<string>>(length);
  for (let i = 0; i < length; i++) {
    const oneOfItem = schema.oneOf[i];
    const oneOfProperties = oneOfItem?.properties as ObjectSchema['properties'];
    if (oneOfProperties) {
      const oneOfItemProperties = Object.keys(oneOfProperties);
      oneOfKeySetList[i] = new Set();
      for (let j = 0, jl = oneOfItemProperties.length; j < jl; j++) {
        const key = oneOfItemProperties[j];
        const schema = oneOfProperties[key];
        if (schema.type === undefined && schema.$ref === undefined) continue;
        oneOfKeySet.add(key);
        oneOfKeySetList[i].add(key);
      }
    }
  }
  return { oneOfKeySet, oneOfKeySetList };
};
