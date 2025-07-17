import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/json-schema';

export const transformConditionalSchema = (
  schema: Partial<JsonSchema>,
  virtual: Dictionary<{ fields: string[] }>,
): Partial<JsonSchema> => {
  // 빈 객체로 시작하고 필요한 프로퍼티만 추가
  const transformed: Partial<JsonSchema> = {};

  // Object.assign으로 then, else, required 제외한 모든 프로퍼티 한번에 복사
  Object.assign(transformed, schema);

  // required 처리
  if (schema.required?.length) {
    const result = transformRequiredWithVirtual(schema.required, virtual);
    transformed.required = result.required;
    if (result.virtualRequired.length)
      transformed.virtual = result.virtualRequired;
  }

  // then/else 재귀 처리 - 삼항 연산자로 간소화
  if (schema.then) {
    transformed.then = transformConditionalSchema(schema.then, virtual);
  }

  if (schema.else) {
    transformed.else = transformConditionalSchema(schema.else, virtual);
  }

  return transformed;
};

const transformRequiredWithVirtual = (
  required: string[],
  virtual: Dictionary<{ fields: string[] }>,
): { required: string[]; virtualRequired: string[] } => {
  const newRequired: string[] = [];
  const virtualRequired: string[] = [];

  // 단일 패스로 처리
  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    const vEntry = virtual[key];

    if (vEntry) {
      // spread보다 push가 V8에서 더 빠름
      newRequired.push(...vEntry.fields);
      virtualRequired.push(key);
    } else {
      newRequired.push(key);
    }
  }

  return { required: newRequired, virtualRequired };
};
