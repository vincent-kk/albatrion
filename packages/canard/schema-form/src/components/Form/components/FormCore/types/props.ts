import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type {
  FieldNode,
  InferFieldNode,
  ValidationMode,
} from '@/schema-form/core';
import type { FormErrorRecord } from '@/schema-form/errors';
import type { VirtualizationOptions } from '@/schema-form/helpers/virtualization';
import type {
  AllowedValue,
  FieldInputDefinition,
  FieldInputMap,
  FieldRendererProps,
  InferValueType,
  JSONSchema,
  ShowError,
  ValidatorFactory,
} from '@/schema-form/types';

/** Live root view passed to function children. */
export interface FormChildrenProps<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: FieldNode['globalErrors'];
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
  /** Apply readOnly property to all FieldInputs (default: false) */
  readOnly?: boolean;
  /** Apply disabled property to all FieldInputs (default: false) */
  disabled?: boolean;
  /** Function called when the value of this SchemaForm changes */
  onChange?: Fn<[value: Value]>;
  /** Function called with the form error list when a validation result changes it or the external error list changes (errors prop, node-level external writes); a validation result that deep-equals the previous one does not call it */
  onValidate?: Fn<[errors: FieldNode['globalErrors']]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** Function called when the state of this SchemaForm changes */
  onStateChange?: Fn<[state: FieldNode['globalState']]>;
  /** Instance error records, including committed construction and render failures. */
  onError?: Fn<[record: FormErrorRecord]>;
  /** Root diagnostics after preparation; initial diagnostics remain on the handle. */
  onDiagnosticsChange?: Fn<[diagnostics: FieldNode['diagnostics']]>;
  /** Default removal policy for inactive fields. */
  unsetOnInactive?: boolean;
  /** Suppress automatic writes without blocking imperative writes. */
  disableAutomaticWrites?: boolean;
  /** List of FieldInput definitions */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldInput path mapping */
  fieldInputMap?: FieldInputMap;
  /** Custom field renderer component */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** Label renderer shared by Form.Label instances. */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** Input renderer shared by Form.Input instances. */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** Error renderer shared by Form.Error instances. */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** Initial validation errors, default is undefined */
  errors?: FieldNode['globalErrors'];
  /** Custom format error function */
  formatError?: FieldRendererProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show
   *   - `false`: Never show
   *   - `ShowError.Dirty`: Show when value has changed
   *   - `ShowError.Touched`: Show after the input has lost focus once
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
