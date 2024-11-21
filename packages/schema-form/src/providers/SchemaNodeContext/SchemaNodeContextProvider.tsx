import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type Ajv from 'ajv';

import { voidFunction } from '@lumy/schema-form/app/constant';
import {
  MethodType,
  type SchemaNode,
  schemaNodeFromSchema,
} from '@lumy/schema-form/core';
import { transformErrors } from '@lumy/schema-form/core/schemaNodes/BaseNode/utils';
import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import { useEffectUntil } from '@lumy/schema-form/hooks/useEffectUntil';
import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaError,
} from '@lumy/schema-form/types';

import { SchemaNodeContext } from './SchemaNodeContext';

export interface SchemaNodeContextProviderProps<
  Value extends AllowedValue = any,
> {
  /** 이 SchemaForm 내에서 사용할 JSON Schema */
  jsonSchema: JsonSchema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value | undefined;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value | undefined>;
  /** 이 SchemaForm의 값이 검증될 때 호출되는 함수 */
  onValidate?: (errors: JsonSchemaError[]) => void;
  /** 이 SchemaForm의 루트 노드가 준비되었을 때 호출되는 함수 */
  onReady?: (rootNode: SchemaNode) => void;
  /** 외부에서 선언된 Ajv 인스턴스, 없으면 내부에서 생성 */
  ajv?: Ajv;
  /** 최초로 입력되는 유효성 검증 오류*/
  errors?: JsonSchemaError[];
}

export const SchemaNodeContextProvider = <Value extends AllowedValue = any>({
  jsonSchema,
  defaultValue,
  onChange = voidFunction,
  onValidate = voidFunction,
  onReady,
  errors,
  ajv,
  children,
}: PropsWithChildren<SchemaNodeContextProviderProps<Value>>) => {
  const initialValue = useConstant(defaultValue);
  const [value, setValue] = useState(() => initialValue);

  const emitChange = useHandle(onChange);
  const handleChange = useHandle(setValue);
  const handleValidate = useHandle(onValidate);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      if (initialValue !== value) {
        emitChange(value);
      }
      isFirstRender.current = false;
    } else {
      emitChange(value);
    }
  }, [initialValue, value, emitChange]);

  const rootNode = useMemo(
    () =>
      schemaNodeFromSchema({
        jsonSchema,
        defaultValue: initialValue,
        onChange: handleChange,
        ajv,
      }),
    [jsonSchema, ajv, initialValue, handleChange],
  );

  useEffectUntil(() => {
    if (rootNode) {
      rootNode.subscribe((type, payload) => {
        if (type === MethodType.Validate) {
          handleValidate(payload);
        }
      });
      onReady?.(rootNode);
      return true;
    }
    return false;
  }, [rootNode]);

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
