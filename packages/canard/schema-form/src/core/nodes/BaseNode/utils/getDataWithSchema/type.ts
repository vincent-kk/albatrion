import { isPlainObject } from '@winglet/common-utils';
import { isArraySchema, isObjectSchema } from '@winglet/json-schema';

import type {
  ArrayValue,
  InferJsonSchemaType,
  ObjectValue,
} from '@/schema-form/types';

export interface StackItem<Value = any> {
  value: Value;
  schema: InferJsonSchemaType<Value>;
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
  isArraySchema(item.schema) && Array.isArray(item.value);
