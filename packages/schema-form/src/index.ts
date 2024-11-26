import {
  Form,
  type FormChildrenProps,
  type FormHandle,
  type FormProps,
} from './components/Form';
import type { GridForm } from './components/SchemaNode/type';
import {
  type SchemaNode,
  isArrayNode,
  isBooleanNode,
  isBranchNode,
  isNumberNode,
  isObjectNode,
  isSchemaNode,
  isStringNode,
  isTerminalNode,
  isVirtualNode,
} from './core';
import {
  ExternalFormContextProvider as FormContextProvider,
  type ExternalFormContextProviderProps as FormContextProviderProps,
} from './providers';
import { JSONPath, ShowError } from './types';
import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
  FormTypeInputPropsWithNode,
  FormTypeInputPropsWithSchema,
  FormTypeRendererProps,
  InferJsonSchemaType,
  JsonSchema,
  JsonSchemaError,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from './types';

export default Form;

export {
  JSONPath,
  ShowError,
  FormContextProvider,
  isArrayNode,
  isBooleanNode,
  isBranchNode,
  isNumberNode,
  isObjectNode,
  isSchemaNode,
  isStringNode,
  isTerminalNode,
  isVirtualNode,
};

export type {
  SchemaNode,
  GridForm,
  FormChildrenProps,
  FormHandle,
  FormProps,
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
  FormTypeInputPropsWithNode,
  FormTypeInputPropsWithSchema,
  InferJsonSchemaType,
  JsonSchema,
  JsonSchemaError,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  FormTypeRendererProps,
  StringSchema,
  VirtualSchema,
  FormContextProviderProps,
};
