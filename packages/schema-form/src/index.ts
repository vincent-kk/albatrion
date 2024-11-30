import {
  Form,
  type FormChildrenProps,
  type FormHandle,
  type FormProps,
} from './components/Form';
import type { GridForm } from './components/SchemaNode';
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
  ExternalFormContextProvider as FormProvider,
  type ExternalFormContextProviderProps as FormProviderProps,
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
  FormatError,
  FormatErrorOptions,
  InferJsonSchemaType,
  JsonSchema,
  JsonSchemaError,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from './types';

export {
  Form,
  type FormChildrenProps,
  type FormHandle,
  type FormProps,
  type GridForm,
};

export { FormProvider, type FormProviderProps };

export {
  isArrayNode,
  isBooleanNode,
  isBranchNode,
  isNumberNode,
  isObjectNode,
  isSchemaNode,
  isStringNode,
  isTerminalNode,
  isVirtualNode,
  type SchemaNode,
};

export {
  JSONPath,
  type JsonSchema,
  type BooleanSchema,
  type NumberSchema,
  type StringSchema,
  type ObjectSchema,
  type VirtualSchema,
  type NullSchema,
  type InferJsonSchemaType,
};

export {
  ShowError,
  type FormatError,
  type FormatErrorOptions,
  type JsonSchemaError,
};

export type {
  FormTypeRendererProps,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
  FormTypeInputPropsWithNode,
  FormTypeInputPropsWithSchema,
};
