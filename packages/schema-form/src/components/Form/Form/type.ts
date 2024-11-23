import type { ReactNode } from 'react';

import type { GridForm } from '@lumy/schema-form/components/SchemaNode/type';
import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputsContextProviderProps,
  SchemaNodeContextProviderProps,
  SchemaNodeRendererContextProviderProps,
  UserDefinedContextProviderProps,
} from '@lumy/schema-form/providers';
import type {
  AllowedValue,
  InferJsonSchemaType,
  InferValueType,
  JsonSchema,
  JsonSchemaError,
} from '@lumy/schema-form/types';

export interface FormChildrenProps<
  Value extends AllowedValue = any,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
> {
  node?: SchemaNode;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: JsonSchemaError[];
  isArrayItem?: boolean;
}

export interface FormProps<
  Value extends AllowedValue = any,
  Schema extends JsonSchema = InferJsonSchemaType<Value>,
> extends SchemaNodeRendererContextProviderProps,
    FormTypeInputsContextProviderProps,
    Omit<SchemaNodeContextProviderProps<Value, Schema>, 'onReady'>,
    UserDefinedContextProviderProps {
  gridFrom?: GridForm;
  children?:
    | ReactNode
    | ((props: FormChildrenProps<Value, Schema>) => ReactNode);
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
  setValue: Fn<[value: Value]>;
}
