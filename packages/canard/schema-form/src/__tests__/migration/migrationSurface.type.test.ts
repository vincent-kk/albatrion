import type { ComponentType, ReactNode, RefObject } from 'react';

import { expect, expectTypeOf, it } from 'vitest';

import type { TrackableHandlerFunction } from '@winglet/common-utils/function';

import type { FormErrorRecord } from '../../errors/index';
import {
  type FieldInputDefinition,
  type FieldInputMap,
  type FieldInputProps,
  type FieldNode,
  FieldNodeEventType,
  FieldNodeRequestType,
  type FieldRendererProps,
  type Form,
  type FormChildrenProps,
  type FormHandle,
  type FormProps,
  type InferFieldNode,
  type SetValueOption,
  type ShowError,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
  type VirtualizationOptions,
  type useChildFieldErrors,
  type useChildFieldMap,
  type useFieldNodeSubscribe,
  type useFieldNodeTracker,
  type useFormSubmit,
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
    onStateChange?: (state: FieldNode['globalState']) => void;
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
    onDiagnosticsChange?: (diagnostics: FieldNode['diagnostics']) => void;
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
    node?: InferFieldNode<Schema>;
    focus: (path?: string) => void;
    select: (path?: string) => void;
    refresh: (path?: string) => void;
    remount: (path?: string) => void;
    reset: (
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ) => void;
    findNode: (path: string) => FieldNode | null;
    findNodes: (path: string) => readonly FieldNode[];
    getState: () => FieldNode['globalState'];
    setState: (state: FieldNode['state']) => void;
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
    Extract<keyof typeof FieldNodeEventType, Retained>
  >().toEqualTypeOf<Retained>();
  expect([
    FieldNodeEventType.UpdateValue,
    FieldNodeEventType.UpdateState,
    FieldNodeEventType.UpdateError,
    FieldNodeEventType.RequestFocus,
    FieldNodeEventType.RequestSelect,
    FieldNodeEventType.RequestRemount,
  ]).toEqual([4, 8, 32, 2048, 4096, 16384]);
});

it('SURFACE-059 commands use request with four kinds and omit retired methods', () => {
  expectTypeOf<FieldNode['request']>().toEqualTypeOf<
    (kind: FieldNodeRequestType) => void
  >();
  expectTypeOf<
    Extract<
      keyof FieldNode,
      'publish' | 'setReadOnly' | 'setDisabled' | 'setVisible'
    >
  >().toEqualTypeOf<never>();
  expect(FieldNodeRequestType).toMatchObject({
    Focus: 2048,
    Select: 4096,
    Refresh: 8192,
    Remount: 16384,
  });
});

it('SURFACE-059 five public hooks retain their callable contracts', () => {
  expectTypeOf<
    ReturnType<typeof useFieldNodeTracker<FieldNode>>
  >().toEqualTypeOf<number>();
  expectTypeOf<
    Parameters<typeof useFieldNodeTracker<FieldNode>>
  >().toEqualTypeOf<[node: FieldNode | null, tracking?: number]>();
  expectTypeOf<
    ReturnType<typeof useFieldNodeSubscribe<FieldNode>>
  >().toEqualTypeOf<void>();
  expectTypeOf<
    Parameters<typeof useFieldNodeSubscribe<FieldNode>>[0]
  >().toEqualTypeOf<FieldNode | null>();
  expectTypeOf<
    Parameters<typeof useFieldNodeSubscribe<FieldNode>>[1]
  >().toEqualTypeOf<Parameters<FieldNode['subscribe']>[0]>();
  expectTypeOf<Parameters<typeof useChildFieldErrors>>().toEqualTypeOf<
    [node: FieldNode, disabled?: boolean]
  >();
  expectTypeOf<ReturnType<typeof useChildFieldErrors>>().toEqualTypeOf<{
    errorMessage: ReactNode;
    showError: boolean;
    formattedError: ReactNode;
    showErrors: boolean[];
    formattedErrors: ReactNode[];
    errorMatrix: (readonly ValidationIssue[])[];
  }>();
  expectTypeOf<Parameters<typeof useChildFieldMap>[0]>().toEqualTypeOf<
    FieldInputProps['ChildFields']
  >();
  expectTypeOf<
    keyof ReturnType<typeof useChildFieldMap<{ name: string }>>
  >().toEqualTypeOf<'name'>();
  expectTypeOf<
    Parameters<typeof useFormSubmit<Schema, string>>
  >().toEqualTypeOf<[ref: RefObject<Handle | null>]>();
  expectTypeOf<
    ReturnType<typeof useFormSubmit<Schema, string>>['pending']
  >().toEqualTypeOf<boolean | undefined>();
  // @ts-expect-error useFieldNode is internal and has no package export.
  type InternalHook = typeof import('../../index').useFieldNode;
  expectTypeOf<InternalHook>().toBeAny();
});

it('SURFACE-059 Form compound component names remain available', () => {
  expectTypeOf<typeof Form>().toHaveProperty('Render');
  expectTypeOf<typeof Form>().toHaveProperty('Field');
  expectTypeOf<typeof Form>().not.toHaveProperty('Group');
  expectTypeOf<typeof Form>().toHaveProperty('Label');
  expectTypeOf<typeof Form>().toHaveProperty('Input');
  expectTypeOf<typeof Form>().toHaveProperty('Error');
});
