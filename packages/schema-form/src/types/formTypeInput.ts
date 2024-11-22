import type { ComponentType } from 'react';

import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';

import type { InferJsonSchemaType, JsonSchema } from './jsonSchema';
import type { AllowedValue } from './value';

/**
 * FormType Input Component가 만족해야 하는 props
 *
 * - `Value`: FormType Component에 할당된 값의 타입
 * - `WatchValues`: JsonSchema에 정의된 watch 속성에 따라 구독하는 값들의 타입
 * - `Context`: Form에 전달된 UserDefinedContext의 타입
 * - `Schema`: FormType Component에 할당된 schema node의 jsonSchema 타입
 * - `Node`: FormType Component에 할당된 schema node의 타입
 */
export interface FormTypeInputProps<
  Value extends AllowedValue = any,
  WatchValues extends any[] = any[],
  Context extends Dictionary = Dictionary,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** FormType Component의 jsonSchema */
  jsonSchema: Schema;
  /** FormType Component의 readonly */
  readonly: boolean;
  /** FormType Component에 할당된 schema node */
  node: Node;
  /** FormType Component에 할당된 schema node의 이름 */
  name: Node['name'];
  /** FormType Component에 할당된 schema node의 경로 */
  path: Node['path'];
  /** FormType Component에 할당된 schema node의 에러 */
  errors: Node['errors'];
  /** JsonSchema에 정의된 watch 속성에 따라 구독하는 값들 */
  watchValues: WatchValues;
  /** FormType Component의 defaultValue */
  defaultValue: Value | undefined;
  /** FormType Component의 value */
  value: Value | undefined;
  /** FormType Component의 onChange */
  onChange: SetStateFn<Value | undefined>;
  /** Form에 전달된 UserDefinedContext */
  context: Context;
  [alt: string]: any;
}

export interface UnknownFormTypeInputProps extends FormTypeInputProps {
  jsonSchema: any;
  node: any;
  watchValues: any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFn<any>;
  context: any;
  [alt: string]: any;
}

export type InferFormTypeInputProps<Value> = Value extends AllowedValue
  ? FormTypeInputProps<Value>
  : UnknownFormTypeInputProps;

export type RestFormTypeInputProps<Props extends FormTypeInputProps> = {
  renderFormComponent?: ComponentType<Props>;
};

export type FormTypeTestFn = Fn<[hint: Hint], boolean>;

export type FormTypeTestObject = Partial<{
  type: JsonSchema['type'] | Array<JsonSchema['type']>;
  jsonSchema: JsonSchema;
  format: JsonSchema['format'] | Array<NonNullable<JsonSchema['format']>>;
  formType: JsonSchema['formType'] | Array<NonNullable<JsonSchema['formType']>>;
  [alt: string]: any;
}>;

export type Hint = {
  jsonSchema: JsonSchema;
  type: JsonSchema['type'];
  format: JsonSchema['format'];
  formType: JsonSchema['formType'];
  path: SchemaNode['path'];
  [alt: string]: any;
};

export type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};

export type FormTypeInputMap<T = unknown> = {
  [path: string]: ComponentType<InferFormTypeInputProps<T>>;
};
