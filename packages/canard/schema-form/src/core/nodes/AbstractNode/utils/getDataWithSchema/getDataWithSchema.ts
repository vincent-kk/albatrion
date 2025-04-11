import { isArray, isPlainObject } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

import type {
  ArrayValue,
  JsonSchemaWithVirtual,
  ObjectValue,
} from '@/schema-form/types';

import {
  type Options,
  type StackItem,
  isArrayStackItem,
  isObjectStackItem,
} from './type';

const omitCache = new WeakMap<
  JsonSchemaWithVirtual,
  Map<string, Set<string>>
>();

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
  options?: Options,
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
  options?: Options,
): boolean => {
  if (current.result) return false;

  current.result = {};
  const value = current.value;
  const schema = current.schema;
  const allowAdditionalProperties = !options?.ignoreAdditionalProperties;

  const inputKeys = Object.keys(value);
  const inputKeysLength = inputKeys.length;
  if (schema.properties) {
    const definedKeys = Object.keys(schema.properties);
    const definedKeysLength = definedKeys.length;
    const omit = definedKeysLength > 0 ? getOmit(schema, value, options) : null;
    for (let i = 0; i < definedKeysLength; i++) {
      const key = definedKeys[i];
      if (value.hasOwnProperty(key) && (!omit || !omit.has(key)))
        stack.push({
          value: value[key],
          schema: schema.properties[key],
          result: undefined,
          parent: current.result,
          key,
        });
    }
    if (allowAdditionalProperties && inputKeysLength !== definedKeysLength) {
      for (let i = 0; i < inputKeysLength; i++) {
        const key = inputKeys[i];
        if (!schema.properties.hasOwnProperty(key))
          current.result[key] = value[key];
      }
    }
  } else if (allowAdditionalProperties) {
    for (let i = 0; i < inputKeysLength; i++) {
      const key = inputKeys[i];
      current.result[key] = value[key];
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
  options?: Options,
): Set<string> | null => {
  if (options?.ignoreOneOf || !jsonSchema.oneOf?.length) return null;
  const schemaCache = omitCache.get(jsonSchema);
  if (schemaCache) {
    const valueKey = JSON.stringify(value);
    const cachedOmit = schemaCache.get(valueKey);
    if (cachedOmit) return cachedOmit;
  }
  const omit = new Set<string>();
  const required = new Set(jsonSchema.required || []);
  const notRequired = new Set<string>();
  const oneOfLength = jsonSchema.oneOf.length;
  for (let i = 0; i < oneOfLength; i++) {
    const oneOfItem = jsonSchema.oneOf[i] as JsonSchemaWithVirtual;
    const oneOfProperties = oneOfItem.properties;
    const oneOfRequired = oneOfItem.required;
    if (isPlainObject(oneOfProperties) && isArray(oneOfRequired)) {
      const key = Object.keys(oneOfProperties)[0];
      const enumValues = oneOfProperties[key]?.enum || [];
      if (enumValues.includes(value?.[key]))
        for (let j = 0; j < oneOfRequired.length; j++)
          required.add(oneOfRequired[j]);
      else
        for (let j = 0; j < oneOfRequired.length; j++)
          notRequired.add(oneOfRequired[j]);
    }
  }
  for (const field of notRequired) {
    if (!required.has(field)) omit.add(field);
  }
  if (!schemaCache) {
    const newCache = new Map();
    newCache.set(JSON.stringify(value), omit);
    omitCache.set(jsonSchema, newCache);
  } else schemaCache.set(JSON.stringify(value), omit);
  return omit;
};

const assignToParent = (current: StackItem, finalResult: any): void => {
  if (current.parent && current.key !== undefined)
    current.parent[current.key] = finalResult;
};
