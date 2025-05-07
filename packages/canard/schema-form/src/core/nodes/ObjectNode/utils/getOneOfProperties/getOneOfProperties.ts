import type { ObjectSchema } from '@/schema-form/types';

export const getOneOfProperties = (
  schema: ObjectSchema,
): Set<string> | undefined => {
  if (!schema.oneOf?.length) return undefined;
  const oneOfKeySet = new Set<string>();
  for (const oneOfItem of schema.oneOf) {
    if (oneOfItem?.properties) {
      const oneOfItemProperties = Object.keys(oneOfItem.properties);
      for (let i = 0; i < oneOfItemProperties.length; i++)
        oneOfKeySet.add(oneOfItemProperties[i]);
    }
  }
  return oneOfKeySet;
};
