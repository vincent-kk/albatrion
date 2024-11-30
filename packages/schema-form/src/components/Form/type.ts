import type { ComponentType, ReactNode } from 'react';

import type Ajv from 'ajv';

import type { GridForm } from '@lumy/schema-form/components/SchemaNode';
import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';
import type {
  AllowedValue,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeRendererProps,
  InferValueType,
  JsonSchema,
  JsonSchemaError,
  SetStateFnWithOptions,
  ShowError,
} from '@lumy/schema-form/types';

export interface FormChildrenProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: SchemaNode;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: JsonSchemaError[];
  isArrayItem?: boolean;
}

export interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm 내에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value | undefined>;
  /** 이 SchemaForm의 값이 검증될 때 호출되는 함수 */
  onValidate?: Fn<[JsonSchemaError[] | undefined]>;
  /** FormTypeInput 정의 목록 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput 경로 매핑 */
  formTypeInputMap?: FormTypeInputMap;
  /** 최초로 입력되는 유효성 검증 오류*/
  errors?: JsonSchemaError[];
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** Custom format error function */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * Error display condition
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   */
  showError?: boolean | ShowError;
  /** 그리드 폼 정의 */
  gridFrom?: GridForm;
  /** 외부에서 선언된 Ajv 인스턴스, 없으면 내부에서 생성 */
  ajv?: Ajv;
  /** 사용자 정의 컨텍스트 */
  context?: Dictionary;
  /** 하위 컴포넌트 */
  children?:
    | ReactNode
    | ((props: FormChildrenProps<Schema, Value>) => ReactNode);
}

export interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  node?: Node;
  focus: Fn<[dataPath: Node['path']]>;
  select: Fn<[dataPath: Node['path']]>;
  reset: Fn<[defaultValue?: Value]>;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
}
