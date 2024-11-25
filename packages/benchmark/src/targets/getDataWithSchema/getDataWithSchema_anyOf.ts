import { isPlainObject } from 'es-toolkit';
import { isArray } from 'es-toolkit/compat';

import {
  type StackItem,
  isArrayStackItem,
  isObjectStackItem,
} from '@lumy/schema-form/core/schemaNodes/BaseNode/utils/getDataWithSchema/type';
import type {
  ArrayValue,
  JsonSchema,
  ObjectSchema,
  ObjectValue,
} from '@lumy/schema-form/types';

export const isObjectAnyOfSchema = (
  schema: NonNullable<ObjectSchema['anyOf']>[number],
): schema is RequiredBy<ObjectSchema, 'properties' | 'required'> =>
  isPlainObject(schema.properties) && Array.isArray(schema.required);

export const getDataWithSchema = <Value>(
  value: Value | undefined,
  schema: JsonSchema,
  options?: { ignoreAnyOf: boolean },
): Value | undefined => {
  if (value == null) return value;

  const stack: StackItem[] = [{ value, schema, result: undefined }];
  let finalResult: Value | undefined;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    if (isObjectStackItem(current)) {
      if (handleObjectSchema(current, stack, options)) {
        continue;
      }
      finalResult = current.result;
      stack.pop();
      assignToParent(current, finalResult);
    } else if (isArrayStackItem(current)) {
      if (handleArraySchema(current, stack)) {
        continue;
      }
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
  options?: { ignoreAnyOf: boolean },
): boolean => {
  if (!current.result) {
    const omit = getOmit(current.schema, current.value, options);
    current.result = {};

    for (const key in current.schema.properties) {
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
    return true;
  }
  return false;
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

// omit 집합 생성 함수
const getOmit = <Value extends Dictionary>(
  jsonSchema: JsonSchema,
  value: Value,
  options?: { ignoreAnyOf: boolean },
): Set<string> | null => {
  if (options?.ignoreAnyOf || !jsonSchema.anyOf?.length) {
    return null;
  }

  const omit = new Set<string>();
  const required = new Set(jsonSchema.required || []);
  const notRequired = new Set<string>();
  for (const {
    properties: anyOfProperties,
    required: anyOfRequired,
  } of jsonSchema.anyOf) {
    if (isPlainObject(anyOfProperties) && isArray(anyOfRequired)) {
      const key = Object.keys(anyOfProperties)[0];
      if ((anyOfProperties[key]?.enum || []).includes(value?.[key])) {
        // required인 경우 해당 필드들을 required set에 추가
        for (const requiredKey of anyOfRequired) {
          required.add(requiredKey);
        }
      } else {
        for (const requiredKey of anyOfRequired) {
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

// 현재 결과를 부모에 할당하는 함수
const assignToParent = (current: StackItem, finalResult: any): void => {
  if (current.parent && current.key !== undefined) {
    current.parent[current.key] = finalResult;
  }
};
