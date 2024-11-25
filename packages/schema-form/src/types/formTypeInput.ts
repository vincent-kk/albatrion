import type { ComponentType, HTMLAttributes } from 'react';

import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';

import type { FormTypeRendererProps } from './formTypeRenderer';
import type { InferJsonSchemaType, JsonSchema } from './jsonSchema';
import type { AllowedValue } from './value';

/**
 * FormType Input Component가 만족해야 하는 props
 *
 * - `Value`: FormType Component에 할당된 값의 타입
 * - `Context`: Form에 전달된 UserDefinedContext의 타입
 * - `WatchValues`: JsonSchema에 정의된 watch 속성에 따라 구독하는 값들의 타입
 * - `Schema`: FormType Component에 할당된 schema node의 jsonSchema 타입
 * - `Node`: FormType Component에 할당된 schema node의 타입
 */
export interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = Dictionary,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** FormType Component의 jsonSchema */
  jsonSchema: Schema;
  /** FormType Component의 readOnly */
  readOnly: boolean;
  /** FormType Component에 할당된 schema node */
  node: Node;
  /** 이 FormType Component의 하위 FormType Components */
  childNodes: WithKey<ComponentType<ChildFormTypeInputProps>>[];
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
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** Form에 전달된 UserDefinedContext */
  context: Context;
  [alt: string]: any;
}

/**
 * FormTypeInputPropsWithSchema 가 만족해야 하는 props
 *
 * - `Value`: FormType Component에 할당된 값의 타입
 * - `Schema`: FormType Component에 할당된 schema node의 jsonSchema 타입
 * - `Context`: Form에 전달된 UserDefinedContext의 타입
 */
export type FormTypeInputPropsWithSchema<
  Value extends AllowedValue = any,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
  Context extends Dictionary = Dictionary,
> = FormTypeInputProps<Value, Context, any[], Schema>;

/**
 * FormTypeInputPropsWithSchema 가 만족해야 하는 props
 *
 * - `Value`: FormType Component에 할당된 값의 타입
 * - `Schema`: FormType Component에 할당된 schema node의 jsonSchema 타입
 * - `Node`: FormType Component에 할당된 schema node의 타입
 */
export type FormTypeInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> = FormTypeInputProps<Value, Dictionary, any[], Schema, Node>;

export interface UnknownFormTypeInputProps extends FormTypeInputProps {
  jsonSchema: any;
  node: any;
  watchValues: any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  context: any;
  [alt: string]: any;
}

export type InferFormTypeInputProps<Value> = Value extends AllowedValue
  ? FormTypeInputProps<Value>
  : UnknownFormTypeInputProps;

export type OverrideFormTypeInputProps = Partial<FormTypeInputProps> &
  Pick<HTMLAttributes<unknown>, 'className'>;

export interface ChildFormTypeInputProps {
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  [alt: string]: any;
}

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

export type SetStateFnWithOptions<S = unknown> = (
  value: S | ((prevState: S) => S),
  options?: SetStateOptions,
) => void;

export type SetStateOptions = { replace?: boolean };
