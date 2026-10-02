import type { ComponentType, ReactNode } from 'react';

import type { TrackableHandlerFunction } from '@winglet/common-utils/function';

import type { Dictionary, Fn } from '@aileron/declare';

import type {
  InferSchemaNode,
  SchemaNode,
  ValidationMode,
} from '@/schema-form/core';
import type { FormErrorRecord } from '@/schema-form/errors';
import type { VirtualizationOptions } from '@/schema-form/helpers/virtualization';
import type {
  AllowedValue,
  AttachedFilesMap,
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeRendererProps,
  InferValueType,
  JSONSchema,
  SetStateFnWithOptions,
  ShowError,
  ValidatorFactory,
} from '@/schema-form/types';

/** Live root view passed to function children. */
export interface FormChildrenProps<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: SchemaNode['globalErrors'];
}

/** Public configuration consumed at load, commit, or input time as documented. */
export interface FormProps<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** JSON Schema to be used within this SchemaForm */
  jsonSchema: Schema;
  /** Default value for this SchemaForm */
  defaultValue?: Value;
  /** Apply readOnly property to all FormTypeInputs (default: false) */
  readOnly?: boolean;
  /** Apply disabled property to all FormTypeInputs (default: false) */
  disabled?: boolean;
  /** Function called when the value of this SchemaForm changes */
  onChange?: Fn<[value: Value]>;
  /** Function called when the value of this SchemaForm is validated */
  onValidate?: Fn<[errors: SchemaNode['globalErrors']]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** Function called when the state of this SchemaForm changes */
  onStateChange?: Fn<[state: SchemaNode['globalState']]>;
  /** Instance error records, including committed construction and render failures. */
  onError?: Fn<[record: FormErrorRecord]>;
  /** Root diagnostics after preparation; initial diagnostics remain on the handle. */
  onDiagnosticsChange?: Fn<[diagnostics: SchemaNode['diagnostics']]>;
  /** Default removal policy for inactive fields. */
  unsetOnInactive?: boolean;
  /** Suppress automatic writes without blocking imperative writes. */
  disableAutomaticWrites?: boolean;
  /** List of FormTypeInput definitions */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput path mapping */
  formTypeInputMap?: FormTypeInputMap;
  /** Custom form type renderer component */
  FormTypeGroupRenderer?: ComponentType<FormTypeRendererProps>;
  /** Label renderer shared by Form.Label instances. */
  FormTypeLabelRenderer?: ComponentType<FormTypeRendererProps>;
  /** Input renderer shared by Form.Input instances. */
  FormTypeInputRenderer?: ComponentType<FormTypeRendererProps>;
  /** Error renderer shared by Form.Error instances. */
  FormTypeErrorRenderer?: ComponentType<FormTypeRendererProps>;
  /** Initial validation errors, default is undefined */
  errors?: SchemaNode['globalErrors'];
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
   * Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** Externally declared ValidatorFactory, creates internally if not provided */
  validatorFactory?: ValidatorFactory;
  /**
   * Render-level virtualization (deferred mount) for large forms (default: off)
   *  - `true`: Enable with default options
   *  - `VirtualizationOptions`: Enable with custom options
   *  - Off-screen fields render as lightweight placeholders and mount when they
   *    approach the viewport, on browser idle time, or on focus/select commands
   *  - The node tree is always fully built; values, validation and submit are unaffected
   *  - Client-side rendering only. Requires IntersectionObserver and is silently
   *    disabled when it is unavailable. Do NOT enable it in SSR/hydration apps:
   *    the server renders all fields while the client gates them, causing a
   *    hydration mismatch.
   */
  virtualization?: boolean | VirtualizationOptions;
  /** User-defined context */
  context?: Dictionary;
  /** Child components */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}

/** Eighteen imperative operations always addressing the current root. */
export interface FormHandle<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[path?: SchemaNode['path']]>;
  select: Fn<[path?: SchemaNode['path']]>;
  refresh: Fn<[path?: SchemaNode['path']]>;
  remount: Fn<[path?: SchemaNode['path']]>;
  reset: Fn;
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  findNodes: Fn<[path: SchemaNode['path']], readonly SchemaNode[]>;
  getState: Fn<[], SchemaNode['globalState']>;
  setState: Fn<[state: SchemaNode['state']]>;
  clearState: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], SchemaNode['globalErrors']>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<SchemaNode['globalErrors']>>;
  showError: Fn<[visible?: boolean]>;
  submit: TrackableHandlerFunction;
}
