import type {
  ArraySchema,
  JsonSchema,
  ObjectSchema,
} from '@lumy/schema-form/types';

interface StackItem {
  data: any;
  schema: JsonSchema;
  result: any;
  isArray?: boolean;
  arrayIndex?: number;
  parent?: any;
  key?: string | number;
}

export const getDataWithSchema = (
  data: any,
  schema: JsonSchema,
  options?: { ignoreAnyOf: boolean },
): any => {
  if (data == null) return data;

  const stack: StackItem[] = [{ data, schema, result: undefined }];
  let finalResult: any;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    if (isObjectSchema(current.schema, current.data)) {
      if (handleObjectSchema(current, stack, options)) {
        continue;
      }
      finalResult = current.result;
      stack.pop();
      assignToParent(current, finalResult);
    } else if (isArraySchema(current.schema, current.data)) {
      if (handleArraySchema(current, stack)) {
        continue;
      }
      finalResult = current.result;
      stack.pop();
      assignToParent(current, finalResult);
    } else {
      finalResult = current.data;
      stack.pop();
      assignToParent(current, finalResult);
    }
  }

  return finalResult;
};

const isObjectSchema = (
  schema: JsonSchema,
  data: any,
): schema is ObjectSchema => {
  return (
    schema.type === 'object' &&
    typeof schema.properties === 'object' &&
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data)
  );
};

const handleObjectSchema = (
  current: StackItem,
  stack: StackItem[],
  options?: { ignoreAnyOf: boolean },
): boolean => {
  if (!current.result) {
    const omit = createOmitSet(current.schema, options);
    current.result = {};

    for (const key in current.schema.properties) {
      if (key in current.data && !omit.has(key)) {
        stack.push({
          data: current.data[key],
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

const isArraySchema = (
  schema: JsonSchema,
  data: any,
): schema is ArraySchema => {
  return (
    schema.type === 'array' &&
    typeof schema.items === 'object' &&
    Array.isArray(data)
  );
};

const handleArraySchema = (current: StackItem, stack: StackItem[]): boolean => {
  if (!current.result) {
    current.result = new Array(current.data.length);
    current.arrayIndex = 0;
  }

  if (current.arrayIndex! < current.data.length) {
    stack.push({
      data: current.data[current.arrayIndex!],
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
const createOmitSet = (
  node: JsonSchema,
  options?: { ignoreAnyOf: boolean },
): Set<string> => {
  const omit = new Set<string>();

  if (
    !options?.ignoreAnyOf &&
    Array.isArray(node.anyOf) &&
    node.anyOf.length > 0
  ) {
    const required = new Set(node.required || []);
    const notRequired = new Set<string>();

    // anyOf 배열의 각 스키마에서 필수가 아닌 필드 수집
    for (const subSchema of node.anyOf) {
      if (subSchema.type === 'object' && subSchema.properties) {
        for (const key in subSchema.properties) {
          if (!required.has(key)) {
            notRequired.add(key);
          }
        }
      }
    }

    // 필수가 아닌 필드들을 omit 셋에 추가
    for (const field of notRequired) {
      if (!required.has(field)) {
        omit.add(field);
      }
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
