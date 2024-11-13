import type { JsonSchema } from '@lumy/schema-form/types';

export const getDataWithSchema = (
  data: any,
  schema: JsonSchema,
  options?: { ignoreAnyOf: boolean },
): any => {
  // 입력값이 null이거나 undefined인 경우 early return
  if (data == null) return data;

  // schema 복사 제거 - 불필요한 객체 생성 방지
  const node = schema;

  // object 타입 처리
  if (
    node.type === 'object' &&
    typeof node.properties === 'object' &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    const omit = new Set<string>(); // Array 대신 Set 사용

    // anyOf 로직
    if (
      !options?.ignoreAnyOf &&
      Array.isArray(node.anyOf) &&
      node.anyOf.length > 0
    ) {
      const required = new Set(node.required || []);
      const notRequired = new Set<string>();

      // ... existing anyOf logic ...

      // Set으로 필터링 최적화
      for (const field of notRequired) {
        if (!required.has(field)) {
          omit.add(field);
        }
      }
    }

    // Object.entries() 대신 for...in 사용
    const result: Record<string, any> = {};
    for (const key in node.properties) {
      if (key in data && !omit.has(key)) {
        result[key] = getDataWithSchema(
          data[key],
          node.properties[key],
          options,
        );
      }
    }
    return result;
  }

  // array 타입 처리
  if (
    node.type === 'array' &&
    typeof node.items === 'object' &&
    Array.isArray(data)
  ) {
    return data.map((e) => getDataWithSchema(e, node.items, options));
  }

  return data;
};
