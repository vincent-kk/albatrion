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
  for (let index = 0; index < length; index++) {
    const oneOfItem = schema.oneOf[index];
    if (oneOfItem?.properties) {
      const oneOfItemProperties = Object.keys(oneOfItem.properties);
      oneOfKeySetList[index] = new Set(oneOfItemProperties);
      for (let i = 0; i < oneOfItemProperties.length; i++)
        oneOfKeySet.add(oneOfItemProperties[i]);
    }
  }
  return { oneOfKeySet, oneOfKeySetList };
};
