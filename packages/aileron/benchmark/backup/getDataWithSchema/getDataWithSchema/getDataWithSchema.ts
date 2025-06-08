import { difference } from '@winglet/common-utils';

import type {
  ArrayValue,
  ObjectSchema,
  ObjectValue,
} from '@/schema-form/types';

import { requiredFactory } from './requiredFactory';
import { type StackItem, isArrayStackItem, isObjectStackItem } from './type';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수
 * @param value 추출할 값
 * @param schema 추출할 값의 스키마
 * @param options 추출 옵션
 * @returns 추출된 값
 */
export const getDataWithSchema = <Value>(
  value: Value | undefined,
  schema: ObjectSchema,
): Value | undefined => {
  if (value == null || !schema.oneOf?.length) return value;

  const stack: StackItem[] = [{ value, schema, result: undefined }];
  let finalResult: Value | undefined;
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (isObjectStackItem(current)) {
      if (handleObjectSchema(current, stack)) continue;
      finalResult = current.result;
      stack.pop();
      assignToParent(current, finalResult);
    } else if (isArrayStackItem(current)) {
      if (handleArraySchema(current, stack)) continue;
      finalResult = current.result;
      stack.pop();
      assignToParent(current, finalResult);
    } else {
      finalResult = current.value;
      stack.pop();
      assignToParent(current, finalResult);
    }
  }
  return finalResult;
};

const handleObjectSchema = (
  current: StackItem<ObjectValue>,
  stack: StackItem[],
): boolean => {
  if (current.result) return false;

  current.result = {};
  const value = current.value;
  const schema = current.schema;
  const properties = schema.properties;
  const propertyKeys = properties ? Object.keys(properties) : null;
  if (propertyKeys?.length) {
    const inputKeys = Object.keys(value);
    const differenceKeys = difference(inputKeys, propertyKeys);
    const required = requiredFactory(schema, value);
    for (let i = propertyKeys.length - 1; i >= 0; i--) {
      const key = propertyKeys[i];
      if (key in value && (!required || required(key)))
        stack.push({
          value: value[key],
          schema: properties![key] as any,
          result: undefined,
          parent: current.result,
          key,
        });
    }
    if (differenceKeys.length)
      for (let i = 0; i < differenceKeys.length; i++) {
        const key = differenceKeys[i];
        if (key in properties!) continue;
        current.result[key] = value[key];
      }
  } else current.result = value;
  return true;
};

const handleArraySchema = (
  current: StackItem<ArrayValue>,
  stack: StackItem[],
): boolean => {
  if (!current.result) {
    current.result = new Array(current.value.length);
    current.arrayIndex = 0;
  }
  if (current.arrayIndex! < current.value.length) {
    stack.push({
      value: current.value[current.arrayIndex!],
      schema: current.schema.items as any,
      result: undefined,
      parent: current.result,
      key: current.arrayIndex,
    });
    current.arrayIndex!++;
    return true;
  }
  return false;
};

const assignToParent = (current: StackItem, finalResult: any): void => {
  if (current.parent && current.key !== undefined)
    current.parent[current.key] = finalResult;
};
