import {
  type FormEvent,
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getTrackableHandler, isFunction } from '@winglet/common-utils';
import {
  useConstant,
  useHandle,
  useVersion,
  withErrorBoundaryForwardRef,
} from '@winglet/react-utils';

import type { Fn, Parameter } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import {
  type InferSchemaNode,
  NodeEventType,
  type SchemaNode,
} from '@/schema-form/core';
import { ValidationError } from '@/schema-form/errors';
import {
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
  InputControlContextProvider,
  RootNodeContextProvider,
  UserDefinedContextProvider,
} from '@/schema-form/providers';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import type { FormHandle, FormProps } from './type';
import { createChildren } from './util';

const UPDATE_CHILDREN_MASK = NodeEventType.Redraw | NodeEventType.UpdateError;

const FormInner = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  {
    jsonSchema: jsonSchemaInput,
    defaultValue: defaultValueInput,
    readOnly,
    disabled,
    onChange,
    onValidate,
    onSubmit: onSubmitInput,
    formTypeInputDefinitions,
    formTypeInputMap,
    CustomFormTypeRenderer,
    errors,
    formatError,
    showError,
    validationMode,
    ajv,
    context,
    children: childrenInput,
  }: FormProps<Schema, Value>,
  ref: ForwardedRef<FormHandle<Schema, Value>>,
) => {
  type Node = InferSchemaNode<Schema>;
  const jsonSchema = useConstant(jsonSchemaInput);
  const [rootNode, setRootNode] = useState<Node>();
  const [children, setChildren] = useState<ReactNode>(
    createChildren(childrenInput, jsonSchema),
  );
  const defaultValue = useConstant(defaultValueInput);
  const ready = useRef(false);
  const [version, update] = useVersion(() => {
    ready.current = false;
  });

  const handleChange = useHandle((input: Parameter<typeof onChange>) => {
    if (!ready.current || !isFunction(onChange)) return;
    if (isFunction(input)) {
      const prevValue = (rootNode?.value || defaultValue) as Value;
      onChange(input(prevValue));
    } else onChange(input);
  });

  const handleValidate = useHandle(onValidate);

  const onSubmit = useHandle(async () => {
    if (!ready.current || !rootNode || !isFunction(onSubmitInput)) return;
    const errors = await rootNode.validate();
    const value = rootNode.value as Value;
    if (errors?.length)
      throw new ValidationError(
        'SCHEMA_VALIDATION_FAILED',
        'Form submission rejected due to validation errors, please check the errors and try again',
        { value, errors, jsonSchema },
      );
    await onSubmitInput(value);
  });
  const handleSubmit = useMemo(
    () =>
      getTrackableHandler(onSubmit, {
        initialState: { loading: false },
        beforeExecute: (_, { update }) => update({ loading: true }),
        afterExecute: (_, { update }) => update({ loading: false }),
      }),
    [onSubmit],
  );
  const handleFormSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await handleSubmit();
    },
    [handleSubmit],
  );

  const handleReady = useHandle((rootNode: Node) => {
    setRootNode(rootNode);
    ready.current = true;
  }) as Fn<[SchemaNode], void>;

  useEffect(() => {
    if (!rootNode) return;
    setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    const unsubscribe = rootNode.subscribe(({ type }) => {
      if (type & UPDATE_CHILDREN_MASK)
        setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    });
    return unsubscribe;
  }, [childrenInput, jsonSchema, rootNode]);

  useImperativeHandle(
    ref,
    () => ({
      node: rootNode,
      focus: (dataPath: string) =>
        rootNode?.find(dataPath)?.publish({ type: NodeEventType.Focus }),
      select: (dataPath: string) =>
        rootNode?.find(dataPath)?.publish({ type: NodeEventType.Select }),
      reset: update,
      getValue: () => rootNode?.value as Value,
      setValue: (value, options) => rootNode?.setValue(value as any, options),
      validate: async () => (await rootNode?.validate()) || [],
      submit: handleSubmit,
    }),
    [rootNode, handleSubmit, update],
  );

  return (
    <UserDefinedContextProvider context={context}>
      <FormTypeInputsContextProvider
        formTypeInputDefinitions={formTypeInputDefinitions}
        formTypeInputMap={formTypeInputMap}
      >
        <FormTypeRendererContextProvider
          CustomFormTypeRenderer={CustomFormTypeRenderer}
          formatError={formatError}
          showError={showError}
        >
          <InputControlContextProvider readOnly={readOnly} disabled={disabled}>
            <RootNodeContextProvider
              key={version}
              jsonSchema={jsonSchema}
              defaultValue={defaultValue}
              errors={errors}
              onChange={handleChange}
              onValidate={handleValidate}
              onReady={handleReady}
              validationMode={validationMode}
              ajv={ajv}
            >
              <form onSubmit={handleFormSubmit}>
                {children || <SchemaNodeProxy />}
              </form>
            </RootNodeContextProvider>
          </InputControlContextProvider>
        </FormTypeRendererContextProvider>
      </FormTypeInputsContextProvider>
    </UserDefinedContextProvider>
  );
};

export const Form = memo(
  withErrorBoundaryForwardRef(forwardRef(FormInner)),
) as <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  props: FormProps<Schema, Value> & {
    ref?: ForwardedRef<FormHandle<Schema, Value>>;
  },
) => ReactNode;
