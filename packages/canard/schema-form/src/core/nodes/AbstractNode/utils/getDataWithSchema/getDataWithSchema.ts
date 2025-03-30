import { isPlainObject } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

import type {
  ArrayValue,
  JsonSchemaWithVirtual,
  ObjectValue,
} from '@/schema-form/types';

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
  schema: JsonSchemaWithVirtual,
  options?: { ignoreOneOf: boolean },
): Value | undefined => {
  if (value == null) return value;
  const stack: StackItem[] = [{ value, schema, result: undefined }];
  let finalResult: Value | undefined;
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (isObjectStackItem(current)) {
      if (handleObjectSchema(current, stack, options)) continue;
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
  options?: { ignoreOneOf: boolean },
): boolean => {
  if (current.result) return false;
  if (current.schema.properties) {
    current.result = {};
    const omit = getOmit(current.schema, current.value, options);
    const keys = Object.keys(current.schema.properties);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      if (key in current.value && !omit?.has(key)) {
        stack.push({
          value: current.value[key],
          schema: current.schema.properties[key],
          result: undefined,
          parent: current.result,
          key,
        });
      }
    }
  }
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
      schema: current.schema.items,
      result: undefined,
      parent: current.result,
      key: current.arrayIndex,
    });
    current.arrayIndex!++;
    return true;
  }
  return false;
};

const getOmit = <Value extends Dictionary>(
  jsonSchema: JsonSchemaWithVirtual,
  value: Value,
  options?: { ignoreOneOf: boolean },
): Set<string> | null => {
  if (options?.ignoreOneOf || !jsonSchema.oneOf?.length) {
    return null;
  }
  const omit = new Set<string>();
  const required = new Set(jsonSchema.required || []);
  const notRequired = new Set<string>();
  for (const {
    properties: oneOfProperties,
    required: oneOfRequired,
  } of jsonSchema.oneOf) {
    if (isPlainObject(oneOfProperties) && Array.isArray(oneOfRequired)) {
      const key = Object.keys(oneOfProperties)[0];
      if ((oneOfProperties[key]?.enum || []).includes(value?.[key])) {
        // required인 경우 해당 필드들을 required set에 추가
        for (const requiredKey of oneOfRequired) {
          required.add(requiredKey);
        }
      } else {
        for (const requiredKey of oneOfRequired) {
          notRequired.add(requiredKey);
        }
      }
    }
  }
  for (const field of notRequired) {
    if (!required.has(field)) {
      omit.add(field);
    }
  }
  return omit;
};

const assignToParent = (current: StackItem, finalResult: any): void => {
  if (current.parent && current.key !== undefined) {
    current.parent[current.key] = finalResult;
  }
};
