import type { ObjectSchema } from '@/schema-form/types';

/**
 * oneOf 키 정보를 나타내는 타입
 */
type OneOfKeyInfo = {
  oneOfKeySet: Set<string>;
  oneOfKeySetList: Array<Set<string>>;
};

/**
 * 오브젝트 스키마의 oneOf 키 정보를 추출합니다.
 * @param schema - 오브젝트 JSON 스키마
 * @returns oneOf 키 정보 또는 oneOf가 없을 경우 undefined
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
