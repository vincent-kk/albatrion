import { isArray, isPlainObject } from '@winglet/common-utils';

import { isArraySchema, isObjectSchema } from '@/json-schema/filter';
import type { InferJsonSchema } from '@/json-schema/types/jsonSchema';
import type { ArrayValue, ObjectValue } from '@/json-schema/types/value';

export interface StackItem<Value = any> {
  value: Value;       // 추출할 값
  schema: InferJsonSchema<Value>;  // 값에 해당하는 스키마
  result: any;       // 추출 결과
  isArray?: boolean;  // 배열 타입 여부
  arrayIndex?: number;  // 배열 처리 시 현재 인덱스
  parent?: any;      // 부모 객체/배열
  key?: string | number;  // 부모 내에서의 키/인덱스
}

export const isObjectStackItem = (
  item: StackItem,
): item is StackItem<ObjectValue> =>
  isObjectSchema(item.schema) && isPlainObject(item.value);

export const isArrayStackItem = (
  item: StackItem,
): item is StackItem<ArrayValue> =>
  isArraySchema(item.schema) && isArray(item.value);
