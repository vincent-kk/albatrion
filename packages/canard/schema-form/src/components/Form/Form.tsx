import {
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { isFunction } from '@winglet/common-utils';
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
import {
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
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
  Node extends SchemaNode = InferSchemaNode<Schema>,
>(
  {
    jsonSchema: jsonSchemaInput,
    defaultValue: defaultValueInput,
    readOnly,
    disabled,
    onChange,
    onValidate,
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
  ref: ForwardedRef<FormHandle<Schema, Value, Node>>,
) => {
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

  const handleReady = useHandle((rootNode: SchemaNode) => {
    setRootNode(rootNode as Node);
    if (isFunction(onChange)) onChange(rootNode.value as Value);
    ready.current = true;
  }) as Fn<[SchemaNode], void>;

  useEffect(() => {
    if (!rootNode) return;
    setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    const unsubscribe = rootNode.subscribe(({ type }) => {
      if (type & UPDATE_CHILDREN_MASK)
        setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    });
    return () => {
      unsubscribe();
    };
  }, [childrenInput, jsonSchema, rootNode]);

  useImperativeHandle(
    ref,
    () => ({
      node: rootNode,
      focus: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish({
          type: NodeEventType.Focus,
        }),
      select: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish({
          type: NodeEventType.Select,
        }),
      refresh: update,
      getValue: () => rootNode?.value as Value,
      setValue: (value, options) => {
        // @ts-expect-error: It can’t be checked due to runtime typing.
        rootNode?.setValue(value, options);
      },
      reset: () => {
        // @ts-expect-error: It can’t be checked due to runtime typing.
        rootNode?.setValue(defaultValue);
      },
      validate: () => {
        rootNode?.validate();
      },
    }),
    [rootNode, defaultValue, update],
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
          <RootNodeContextProvider
            key={version}
            jsonSchema={jsonSchema}
            defaultValue={defaultValue}
            readOnly={readOnly}
            disabled={disabled}
            errors={errors}
            onChange={handleChange}
            onValidate={handleValidate}
            onReady={handleReady}
            validationMode={validationMode}
            ajv={ajv}
          >
              {children || <SchemaNodeProxy />}
          </RootNodeContextProvider>
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
