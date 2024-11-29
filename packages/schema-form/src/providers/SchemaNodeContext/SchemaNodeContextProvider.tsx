import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type Ajv from 'ajv';

import {
  MethodType,
  type SchemaNode,
  nodeFromJsonSchema,
} from '@lumy/schema-form/core';
import { transformErrors } from '@lumy/schema-form/helpers/error';
import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaError,
} from '@lumy/schema-form/types';

import { SchemaNodeContext } from './SchemaNodeContext';

export interface SchemaNodeContextProviderProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  /** 이 SchemaForm 내에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value | undefined;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value | undefined>;
  /** 이 SchemaForm의 값이 검증될 때 호출되는 함수 */
  onValidate?: Fn<[JsonSchemaError[] | undefined]>;
  /** 외부에서 선언된 Ajv 인스턴스, 없으면 내부에서 생성 */
  ajv?: Ajv;
  /** 최초로 입력되는 유효성 검증 오류*/
  errors?: JsonSchemaError[];
}

interface SchemaNodeContextProviderInnerProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> extends SchemaNodeContextProviderProps<Schema, Value> {
  /** 이 SchemaForm의 루트 노드가 준비되었을 때 호출되는 함수 */
  onReady?: Fn<[SchemaNode]>;
}

export const SchemaNodeContextProvider = <
  Value extends AllowedValue,
  Schema extends JsonSchema,
>({
  jsonSchema,
  defaultValue,
  onChange,
  onValidate,
  onReady,
  errors,
  ajv,
  children,
}: PropsWithChildren<
  RequiredBy<
    SchemaNodeContextProviderInnerProps<Schema, Value>,
    'onChange' | 'onValidate' | 'onReady'
  >
>) => {
  const initialValue = useConstant(defaultValue);
  const [value, handleChange] = useState(() => initialValue);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      if (initialValue !== value) {
        onChange(value);
      }
      isFirstRender.current = false;
    } else {
      onChange(value);
    }
  }, [initialValue, value, onChange]);

  const rootNode = useMemo(
    () =>
      nodeFromJsonSchema({
        jsonSchema,
        defaultValue: initialValue,
        onChange: handleChange,
        ajv,
      }),
    [jsonSchema, ajv, initialValue, handleChange],
  );

  useEffect(() => {
    if (!rootNode) return;
    const unsubscribe = rootNode.subscribe(({ type, payload }) => {
      if (type === MethodType.Validate) {
        onValidate(payload);
      }
    });
    onReady(rootNode);
    return () => unsubscribe();
  }, [rootNode, onValidate, onReady]);

  const lastErrorDictionary = useRef<
    Record<JsonSchemaError['dataPath'], JsonSchemaError[]>
  >({});

  useEffect(() => {
    if (!rootNode) return;

    const transformedErrors = errors ? transformErrors(errors, true) : [];
    const currentErrorDictionary: Record<string, JsonSchemaError[]> = {};

    transformedErrors.forEach((error) => {
      if (!currentErrorDictionary[error.dataPath]) {
        currentErrorDictionary[error.dataPath] = [];
      }
      currentErrorDictionary[error.dataPath].push(error);
    });

    rootNode.setReceivedErrors(transformedErrors);

    const paths = new Set([
      ...Object.keys(lastErrorDictionary.current),
      ...Object.keys(currentErrorDictionary),
    ]);

    for (const path of paths) {
      const node = rootNode.findNode(path);
      if (node) {
        node.setReceivedErrors(currentErrorDictionary[path]);
      }
    }

    lastErrorDictionary.current = currentErrorDictionary;
  }, [errors, rootNode]);

  return (
    <SchemaNodeContext.Provider value={{ rootNode }}>
      {children}
    </SchemaNodeContext.Provider>
  );
};
