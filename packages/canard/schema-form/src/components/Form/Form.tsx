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

import type { Fn, Parameter } from '@aileron/types';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import {
  type InferSchemaNode,
  NodeEventType,
  type SchemaNode,
  isObjectNode,
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
  ObjectValue,
} from '@/schema-form/types';

import type { FormHandle, FormProps } from './type';
import { createChildren } from './util';

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
  const initialDefaultValue = useConstant(defaultValueInput);
  const [defaultValue, setDefaultValue] = useState<Value | undefined>(
    initialDefaultValue,
  );
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
      if (type & (NodeEventType.Redraw | NodeEventType.UpdateError))
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
      reset: (defaultValue) => {
        setDefaultValue(defaultValue ?? initialDefaultValue);
        update();
      },
      getValue: () => rootNode?.value as Value,
      setValue: (input, options) => {
        if (!rootNode) return;
        const inputValue = isFunction(input)
          ? input(rootNode.value as Value)
          : input;
        if (isObjectNode(rootNode)) {
          rootNode.setValue(inputValue as ObjectValue, options);
          setDefaultValue(rootNode.value as Value);
        } else {
          setDefaultValue(inputValue as Value);
        }
        update();
      },
      validate: () => {
        rootNode?.validate();
      },
    }),
    [initialDefaultValue, rootNode, update],
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
            {children || <SchemaNodeProxy path="" />}
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
