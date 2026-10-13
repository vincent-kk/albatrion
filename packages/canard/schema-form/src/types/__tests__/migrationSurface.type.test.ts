import type { ComponentType, ReactNode, RefObject } from 'react';

import { expect, expectTypeOf, it } from 'vitest';

import type { TrackableHandlerFunction } from '@winglet/common-utils/function';

import type { FormErrorRecord } from '../../errors';
import {
  type FieldInputDefinition,
  type FieldInputMap,
  type FieldInputProps,
  type FieldRendererProps,
  type Form,
  type FormChildrenProps,
  type FormHandle,
  type FormProps,
  type InferSchemaNode,
  type SchemaNode,
  SchemaNodeEventType,
  SchemaNodeRequestType,
  type SetValueOption,
  type ShowError,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
  type VirtualizationOptions,
  type useChildNodeComponentMap,
  type useChildNodeErrors,
  type useFormSubmit,
  type useSchemaNodeSubscribe,
  type useSchemaNodeTracker,
} from '../../index';

type Schema = { type: 'string' };
type Props = FormProps<Schema, string>;
type Handle = FormHandle<Schema, string>;

it('SURFACE-059 FormProps retains nineteen baseline fields with declared replacements and additions', () => {
  type Expected = {
    jsonSchema: Schema;
    defaultValue?: string;
    readOnly?: boolean;
    disabled?: boolean;
    onChange?: (value: string) => void;
    onValidate?: (errors: readonly ValidationIssue[]) => void;
    onSubmit?: (value: string) => Promise<void> | void;
    onStateChange?: (state: SchemaNode['globalState']) => void;
    fieldInputDefinitions?: FieldInputDefinition[];
    fieldInputMap?: FieldInputMap;
    FieldRenderer?: ComponentType<FieldRendererProps>;
    errors?: readonly ValidationIssue[];
    formatError?: FieldRendererProps['formatError'];
    showError?: boolean | ShowError;
    validationMode?: ValidationMode;
    validatorFactory?: ValidatorFactory;
    virtualization?: boolean | VirtualizationOptions;
    context?: Record<string, any>;
    children?:
      | ReactNode
      | ((props: FormChildrenProps<Schema, string>) => ReactNode);
    onError?: (record: FormErrorRecord) => void;
    unsetOnInactive?: boolean;
    disableAutomaticWrites?: boolean;
    onDiagnosticsChange?: (diagnostics: SchemaNode['diagnostics']) => void;
    FormLabelRenderer?: ComponentType<FieldRendererProps>;
    FormInputRenderer?: ComponentType<FieldRendererProps>;
    FormErrorRenderer?: ComponentType<FieldRendererProps>;
  };
  expectTypeOf<Props>().toEqualTypeOf<Expected>();
  expectTypeOf<Props>().toHaveProperty('FieldRenderer');
  expectTypeOf<
    Extract<keyof Props, 'CustomFieldRenderer'>
  >().toEqualTypeOf<never>();
});

it('SURFACE-059 FormHandle has exactly eighteen typed members', () => {
  type Expected = {
    node?: InferSchemaNode<Schema>;
    focus: (path?: string) => void;
    select: (path?: string) => void;
    refresh: (path?: string) => void;
    remount: (path?: string) => void;
    reset: (
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ) => void;
    findNode: (path: string) => SchemaNode | null;
    findNodes: (path: string) => readonly SchemaNode[];
    getState: () => SchemaNode['globalState'];
    setState: (state: SchemaNode['state']) => void;
    clearState: () => void;
    getValue: () => string;
    setValue: (
      value: string | ((previous: string) => string),
      options?: SetValueOption,
    ) => void;
    getErrors: () => readonly ValidationIssue[];
    getAttachedFilesMap: () => Map<string, File[]>;
    validate: () => Promise<readonly ValidationIssue[]>;
    showError: (visible?: boolean) => void;
    submit: TrackableHandlerFunction;
  };
  expectTypeOf<Handle>().toEqualTypeOf<Expected>();
});

it('SURFACE-059 ValidationMode retains None OnChange and OnRequest', () => {
  expect(ValidationMode.None).toBe(0);
  expect(ValidationMode.OnChange).toBe(1);
  expect(ValidationMode.OnRequest).toBe(2);
  expectTypeOf<keyof typeof ValidationMode>().toEqualTypeOf<
    'None' | 'OnChange' | 'OnRequest'
  >();
});

it('SURFACE-059 six public event names remain available after the enum rename', () => {
  type Retained =
    | 'UpdateValue'
    | 'UpdateState'
    | 'UpdateError'
    | 'RequestFocus'
    | 'RequestSelect'
    | 'RequestRemount';
  expectTypeOf<
    Extract<keyof typeof SchemaNodeEventType, Retained>
  >().toEqualTypeOf<Retained>();
  expect([
    SchemaNodeEventType.UpdateValue,
    SchemaNodeEventType.UpdateState,
    SchemaNodeEventType.UpdateError,
    SchemaNodeEventType.RequestFocus,
    SchemaNodeEventType.RequestSelect,
    SchemaNodeEventType.RequestRemount,
  ]).toEqual([4, 8, 32, 2048, 4096, 16384]);
});

it('SURFACE-059 commands use request with four kinds and omit retired methods', () => {
  expectTypeOf<SchemaNode['request']>().toEqualTypeOf<
    (kind: SchemaNodeRequestType) => void
  >();
  expectTypeOf<
    Extract<
      keyof SchemaNode,
      'publish' | 'setReadOnly' | 'setDisabled' | 'setVisible'
    >
  >().toEqualTypeOf<never>();
  expect(SchemaNodeRequestType).toMatchObject({
    Focus: 2048,
    Select: 4096,
    Refresh: 8192,
    Remount: 16384,
  });
});

it('SURFACE-059 five public hooks retain their callable contracts', () => {
  expectTypeOf<
    ReturnType<typeof useSchemaNodeTracker<SchemaNode>>
  >().toEqualTypeOf<number>();
  expectTypeOf<
    Parameters<typeof useSchemaNodeTracker<SchemaNode>>
  >().toEqualTypeOf<[node: SchemaNode | null, tracking?: number]>();
  expectTypeOf<
    ReturnType<typeof useSchemaNodeSubscribe<SchemaNode>>
  >().toEqualTypeOf<void>();
  expectTypeOf<
    Parameters<typeof useSchemaNodeSubscribe<SchemaNode>>[0]
  >().toEqualTypeOf<SchemaNode | null>();
  expectTypeOf<
    Parameters<typeof useSchemaNodeSubscribe<SchemaNode>>[1]
  >().toEqualTypeOf<Parameters<SchemaNode['subscribe']>[0]>();
  expectTypeOf<Parameters<typeof useChildNodeErrors>>().toEqualTypeOf<
    [node: SchemaNode, disabled?: boolean]
  >();
  expectTypeOf<ReturnType<typeof useChildNodeErrors>>().toEqualTypeOf<{
    errorMessage: ReactNode;
    showError: boolean;
    formattedError: ReactNode;
    showErrors: boolean[];
    formattedErrors: ReactNode[];
    errorMatrix: (readonly ValidationIssue[])[];
  }>();
  expectTypeOf<Parameters<typeof useChildNodeComponentMap>[0]>().toEqualTypeOf<
    FieldInputProps['ChildNodeComponents']
  >();
  expectTypeOf<
    keyof ReturnType<typeof useChildNodeComponentMap<{ name: string }>>
  >().toEqualTypeOf<'name'>();
  expectTypeOf<
    Parameters<typeof useFormSubmit<Schema, string>>
  >().toEqualTypeOf<[ref: RefObject<Handle | null>]>();
  expectTypeOf<
    ReturnType<typeof useFormSubmit<Schema, string>>['pending']
  >().toEqualTypeOf<boolean | undefined>();
  // @ts-expect-error useSchemaNode is internal and has no package export.
  type InternalHook = typeof import('../../index').useSchemaNode;
  expectTypeOf<InternalHook>().toBeAny();
});

it('SURFACE-059 Form compound component names remain available', () => {
  expectTypeOf<typeof Form>().toHaveProperty('Render');
  expectTypeOf<typeof Form>().toHaveProperty('Group');
  expectTypeOf<typeof Form>().toHaveProperty('Label');
  expectTypeOf<typeof Form>().toHaveProperty('Input');
  expectTypeOf<typeof Form>().toHaveProperty('Error');
});
