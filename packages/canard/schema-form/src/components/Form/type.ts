import type { ComponentType, ReactNode } from 'react';

import type Ajv from 'ajv';

import type { Dictionary, Fn, SetStateFn } from '@aileron/declare';

import type {
  InferSchemaNode,
  SchemaNode,
  ValidationMode,
} from '@/schema-form/core';
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
} from '@/schema-form/types';

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
  /** FormTypeInput 전체에 readOnly 속성 적용 */
  readOnly?: boolean;
  /** FormTypeInput 전체에 disabled 속성 적용 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value>;
  /** 이 SchemaForm의 값이 검증될 때 호출되는 함수 */
  onValidate?: Fn<[JsonSchemaError[]]>;
  /** FormTypeInput 정의 목록 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput 경로 매핑 */
  formTypeInputMap?: FormTypeInputMap;
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** 최초로 입력되는 유효성 검증 오류, 기본값은 undefined */
  errors?: JsonSchemaError[];
  /** Custom format error function */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   *   - `ShowError.DirtyTouched`: Dirty 상태와 Touched 상태가 모두 충족된 경우 노출
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
   *  - `ValidationMode.None`: 유효성 검증 비활성화
   *  - `ValidationMode.OnChange`: 값이 변경될 때 유효성 검증
   *  - `ValidationMode.OnRequest`: 요청할 때 유효성 검증
   */
  validationMode?: ValidationMode;
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
  refresh: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  reset: Fn;
  validate: Fn;
}
