import { isArray, isPlainObject } from '@winglet/common-utils';

import { isArraySchema, isObjectSchema } from '@/json-schema/filter';
import type { InferJsonSchema } from '@/json-schema/types/jsonSchema';
import type { ArrayValue, ObjectValue } from '@/json-schema/types/value';

export interface StackItem<Value = any> {
  value: Value;
  schema: InferJsonSchema<Value>;
  result: any;
  isArray?: boolean;
  arrayIndex?: number;
  parent?: any;
  key?: string | number;
}

export const isObjectStackItem = (
  item: StackItem,
): item is StackItem<ObjectValue> =>
  isObjectSchema(item.schema) && isPlainObject(item.value);

export const isArrayStackItem = (
  item: StackItem,
): item is StackItem<ArrayValue> =>
  isArraySchema(item.schema) && isArray(item.value);
