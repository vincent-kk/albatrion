import type { ReactNode } from 'react';

import type { GridForm } from '@lumy/schema-form/components/SchemaNode';
import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputsContextProviderProps,
  FormTypeRendererContextProviderProps,
  SchemaNodeContextProviderProps,
  UserDefinedContextProviderProps,
} from '@lumy/schema-form/providers';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
  JsonSchemaError,
  SetStateFnWithOptions,
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
> extends FormTypeRendererContextProviderProps,
    FormTypeInputsContextProviderProps,
    SchemaNodeContextProviderProps<Schema>,
    UserDefinedContextProviderProps {
  gridFrom?: GridForm;
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
