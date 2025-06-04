import type { ComponentType, ReactNode } from 'react';

import type Ajv from 'ajv';

import type { TrackableHandlerFunction } from '@winglet/common-utils';

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
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: JsonSchemaError[];
}

export interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** JSON Schema to be used within this SchemaForm */
  jsonSchema: Schema;
  /** Default value for this SchemaForm */
  defaultValue?: Value;
  /** Apply readOnly property to all FormTypeInputs */
  readOnly?: boolean;
  /** Apply disabled property to all FormTypeInputs */
  disabled?: boolean;
  /** Function called when the value of this SchemaForm changes */
  onChange?: SetStateFn<Value>;
  /** Function called when the value of this SchemaForm is validated */
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** List of FormTypeInput definitions */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput path mapping */
  formTypeInputMap?: FormTypeInputMap;
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** Initial validation errors, default is undefined */
  errors?: JsonSchemaError[];
  /** Custom format error function */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show
   *   - `false`: Never show
   *   - `ShowError.Dirty`: Show when value has changed
   *   - `ShowError.Touched`: Show when input has been focused
   *   - `ShowError.DirtyTouched`: Show when both Dirty and Touched states are met
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** Externally declared Ajv instance, creates internally if not provided */
  ajv?: Ajv;
  /** User-defined context */
  context?: Dictionary;
  /** Child components */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}

export interface FormHandle<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;
  reset: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  submit: TrackableHandlerFunction;
}
