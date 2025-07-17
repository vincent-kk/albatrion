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
      // virtual 키인 경우: virtual[key].fields의 모든 필드를 required에 추가
      newRequired.push(...virtual[key].fields);
      virtualRequired.push(key);
    } else {
      // 일반 키인 경우: 그대로 유지
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

  // required 배열이 있는 경우 변환
  if (schema.required && Array.isArray(schema.required)) {
    const { required: newRequired, virtualRequired } =
      transformRequiredWithVirtual(schema.required, virtual);

    transformed.required = newRequired;

    // virtual 키가 있는 경우 virtual 프로퍼티에 추가
    if (virtualRequired.length > 0) {
      transformed.virtual = virtualRequired;
    }
  }

  // then과 else를 재귀적으로 처리
  if (schema.then) {
    transformed.then = transformConditionalSchema(schema.then, virtual);
  }

  if (schema.else) {
    transformed.else = transformConditionalSchema(schema.else, virtual);
  }

  return transformed;
};
