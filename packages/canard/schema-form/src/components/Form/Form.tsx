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

import { isFunction } from '@winglet/common-utils/filter';
import { getTrackableHandler } from '@winglet/common-utils/function';
import { withErrorBoundaryForwardRef } from '@winglet/react-utils/hoc';
import { useHandle, useMemorize, useVersion } from '@winglet/react-utils/hook';

import type { Fn, Parameter } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import {
  type InferSchemaNode,
  NodeEventType,
  type SchemaNode,
} from '@/schema-form/core';
import { ValidationError } from '@/schema-form/errors';
import { preprocessSchema } from '@/schema-form/helpers/jsonSchema';
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
    jsonSchema: inputJsonSchema,
    defaultValue: inputDefaultValue,
    readOnly,
    disabled,
    onChange,
    onValidate,
    onSubmit: inputOnSubmit,
    formTypeInputDefinitions,
    formTypeInputMap,
    CustomFormTypeRenderer,
    errors,
    formatError,
    showError: inputShowError,
    validationMode,
    validatorFactory,
    context,
    children: inputChildren,
  }: FormProps<Schema, Value>,
  ref: ForwardedRef<FormHandle<Schema, Value>>,
) => {
  type Node = InferSchemaNode<Schema>;
  const ready = useRef(false);
  const [version, update] = useVersion(() => {
    ready.current = false;
  });

  const jsonSchema = useMemorize(
    () => preprocessSchema(inputJsonSchema),
    [version],
  );
  const defaultValue = useMemorize(inputDefaultValue, [version]);

  const [rootNode, setRootNode] = useState<Node>();
  const [children, setChildren] = useState<ReactNode>(
    createChildren(inputChildren, jsonSchema),
  );
  const [showError, setShowError] = useState(inputShowError);

  const handleChange = useHandle((input: Parameter<typeof onChange>) => {
    if (!ready.current || !isFunction(onChange)) return;
    if (isFunction(input)) {
      const prevValue = (rootNode?.value || defaultValue) as Value;
      onChange(input(prevValue));
    } else onChange(input);
  });

  const handleValidate = useHandle(onValidate);

  const onSubmit = useHandle(async () => {
    if (!ready.current || !rootNode || !isFunction(inputOnSubmit)) return;
    const value = rootNode.value as Value;
    const errors = await rootNode.validate();
    if (errors.length > 0)
      throw new ValidationError(
        'SCHEMA_VALIDATION_FAILED',
        'Form submission rejected due to validation errors, please check the errors and try again',
        { value, errors, jsonSchema },
      );
    await inputOnSubmit(value);
  });
  const handleSubmit = useMemo(() => getTrackableHandler(onSubmit), [onSubmit]);
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
    setChildren(createChildren(inputChildren, jsonSchema, rootNode));
    const unsubscribe = rootNode.subscribe(({ type }) => {
      if (type & UPDATE_CHILDREN_MASK)
        setChildren(createChildren(inputChildren, jsonSchema, rootNode));
    });
    return unsubscribe;
  }, [inputChildren, jsonSchema, rootNode]);

  useImperativeHandle(
    ref,
    () => ({
      node: rootNode,
      focus: (path: string) =>
        rootNode?.find(path)?.publish({ type: NodeEventType.Focus }),
      select: (path: string) =>
        rootNode?.find(path)?.publish({ type: NodeEventType.Select }),
      reset: update,
      getValue: () => rootNode?.value as Value,
      setValue: (value, options) => rootNode?.setValue(value as any, options),
      validate: async () => (await rootNode?.validate()) || [],
      showError: (visible = true) =>
        visible ? setShowError(true) : setShowError(inputShowError),
      submit: handleSubmit,
    }),
    [rootNode, handleSubmit, update, inputShowError],
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
              validatorFactory={validatorFactory}
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
