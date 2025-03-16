import { type PropsWithChildren, useEffect, useMemo, useRef } from 'react';

import { EMPTY_ARRAY } from '@winglet/common-utils';

import type { Fn } from '@aileron/types';

import type { FormProps } from '@/schema-form/components/Form';
import {
  NodeMethod,
  type SchemaNode,
  type ValidationMode,
  nodeFromJsonSchema,
} from '@/schema-form/core';
import { transformErrors } from '@/schema-form/helpers/error';
import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaError,
} from '@/schema-form/types';

import { RootNodeContext } from './RootNodeContext';

interface RootNodeContextProviderProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  /** 이 SchemaForm 내에서 사용할 JSON Schema */
  jsonSchema: FormProps<Schema, Value>['jsonSchema'];
  /** 이 SchemaForm의 기본값 */
  defaultValue?: FormProps<Schema, Value>['defaultValue'];
  /** 최초로 입력되는 유효성 검증 오류, 기본값은 undefined */
  errors?: FormProps<Schema, Value>['errors'];
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange: NonNullable<FormProps<Schema, Value>['onChange']>;
  /** 이 SchemaForm의 값이 검증될 때 호출되는 함수 */
  onValidate: NonNullable<FormProps<Schema, Value>['onValidate']>;
  /** 이 SchemaForm의 루트 노드가 준비되었을 때 호출되는 함수 */
  onReady: Fn<[SchemaNode]>;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
   *  - `ValidationMode.None`: 유효성 검증 비활성화
   *  - `ValidationMode.OnChange`: 값이 변경될 때 유효성 검증
   *  - `ValidationMode.OnRequest`: 요청할 때 유효성 검증
   */
  validationMode: ValidationMode;
  /** 외부에서 선언된 Ajv 인스턴스, 없으면 내부에서 생성 */
  ajv?: FormProps<Schema, Value>['ajv'];
}

export const RootNodeContextProvider = <
  Value extends AllowedValue,
  Schema extends JsonSchema,
>({
  jsonSchema,
  defaultValue,
  errors,
  onChange,
  onValidate,
  onReady,
  validationMode,
  ajv,
  children,
}: PropsWithChildren<RootNodeContextProviderProps<Schema, Value>>) => {
  const rootNode = useMemo(
    () =>
      nodeFromJsonSchema({
        jsonSchema,
        defaultValue,
        onChange,
        validationMode,
        ajv,
      }),
    [jsonSchema, defaultValue, onChange, validationMode, ajv],
  );

  useEffect(() => {
    if (!rootNode) return;
    const unsubscribe = rootNode.subscribe(({ type, payload }) => {
      if (type & NodeMethod.UpdateError) onValidate(payload || EMPTY_ARRAY);
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
    <RootNodeContext.Provider value={rootNode}>
      {children}
    </RootNodeContext.Provider>
  );
};
