import { map, weakMapCacheFactory } from '@winglet/common-utils';

import type { JsonSchema, ObjectSchema } from '@/schema-form/types';

type OneOfDetail = {
  properties: Array<[string, Partial<JsonSchema>]>;
  requiredFields: Array<string>;
};

const { get, set } = weakMapCacheFactory<OneOfDetail[], JsonSchema>();

/**
 * 스키마를 분석하여 특정 값에 대해 어떤 속성을 제외해야 하는지 결정하는 함수를 반환합니다.
 * 스키마 분석은 함수 생성 시점에 수행되어 클로저에 저장됩니다.
 * @param schema 분석할 스키마
 * @param options 옵션
 * @returns 값을 받아 제외할 속성 집합을 반환하는 함수
 */
export const requiredFactory = (
  schema: ObjectSchema,
  value: Dictionary,
): ((key: string) => boolean) | null => {
  const cachedOneOfDetails = get(schema);
  if (cachedOneOfDetails) return getRequiredFactory(cachedOneOfDetails, value);

  const oneOfDetails = analyzeOneOfSchema(schema);
  set(schema, oneOfDetails);
  return getRequiredFactory(oneOfDetails, value);
};

const getRequiredFactory = (oneOfDetails: OneOfDetail[], value: Dictionary) => {
  const required = new Set<string>();
  for (let i = 0; i < oneOfDetails.length; i++) {
    const { properties, requiredFields } = oneOfDetails[i];
    for (let j = 0; j < properties.length; j++) {
      const [key, property] = properties[j];
      if (
        ('const' in property && property.const === value[key]) ||
        ('enum' in property && property.enum.includes(value[key]))
      )
        for (const requiredField of requiredFields) required.add(requiredField);
    }
  }
  return (key: string) => required.has(key);
};

/**
 * 스키마를 분석하여 properties와 oneOf 데이터를 상세하게 추출합니다.
 * @param schema 분석할 스키마
 * @returns 분석된 스키마 정보
 */
const analyzeOneOfSchema = (schema: JsonSchema) => {
  const oneOfDetails: OneOfDetail[] = [];
  const oneOfLength = schema.oneOf?.length;
  if (!oneOfLength) return oneOfDetails;
  for (let i = 0; i < oneOfLength; i++) {
    const oneOfItem = schema.oneOf![i] as JsonSchema;
    if (!oneOfItem.properties) continue;
    const properties = Object.entries(
      oneOfItem.properties,
    ) as OneOfDetail['properties'];
    oneOfDetails.push({
      properties,
      requiredFields: Array.from(
        new Set<string>([
          ...(oneOfItem.required || []),
          ...map(properties, ([key]) => key),
        ]),
      ),
    });
  }
  return oneOfDetails;
};
