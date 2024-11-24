import {
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import {
  type InferSchemaNode,
  MethodType,
  type SchemaNode,
} from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';
import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import { useTick } from '@lumy/schema-form/hooks/useTick';
import {
  FormTypeInputsContextProvider,
  SchemaNodeContextProvider,
  SchemaNodeRendererContextProvider,
  UserDefinedContextProvider,
} from '@lumy/schema-form/providers';
import {
  type AllowedValue,
  type InferValueType,
  type JsonSchema,
  ShowError,
} from '@lumy/schema-form/types';

import type { FormHandle, FormProps } from './type';
import { createChildren } from './util';

const FormInner = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
>(
  {
    jsonSchema: jsonSchemaInput,
    defaultValue,
    onChange,
    onValidate,
    formTypeInputDefinitions,
    formTypeInputMap,
    CustomSchemaNodeRenderer,
    gridFrom,
    children: childrenInput,
    formatError,
    errors,
    showError = ShowError.Dirty & ShowError.Touched,
    context,
    ajv,
  }: FormProps<Schema, Value>,
  ref: ForwardedRef<FormHandle<Schema, Value, Node>>,
) => {
  const [tick, update] = useTick();
  const [rootNode, setRootNode] = useState<Node>();
  const jsonSchema = useConstant(jsonSchemaInput);
  const [children, setChildren] = useState<ReactNode>();

  const handleChange = useHandle((input) => {
    if (isFunction(onChange))
      onChange(isFunction(input) ? input(rootNode?.value) : input);
  });

  const handleReady = useHandle((rootNode: SchemaNode) => {
    setRootNode(rootNode as Node);
  });

  useEffect(() => {
    if (!rootNode) return;
    setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    const unsubscribe = rootNode.subscribe(({ type }) => {
      if (
        type === MethodType.Validate ||
        type === MethodType.Change ||
        type === MethodType.Redraw
      )
        setChildren(createChildren(childrenInput, jsonSchema, rootNode));
    });
    return () => unsubscribe();
  }, [childrenInput, jsonSchema, rootNode]);

  useImperativeHandle(
    ref,
    () => ({
      node: rootNode,
      focus: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish(MethodType.Focus, void 0),
      select: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish(MethodType.Select, void 0),
      refresh: update,
      getValue: () => rootNode?.value as Value,
      setValue: (input: Value) => {
        rootNode?.setValue(input as any);
      },
    }),
    [rootNode, update],
  );

  return (
    <UserDefinedContextProvider context={context}>
      <FormTypeInputsContextProvider
        formTypeInputDefinitions={formTypeInputDefinitions}
        formTypeInputMap={formTypeInputMap}
      >
        <SchemaNodeRendererContextProvider
          CustomSchemaNodeRenderer={CustomSchemaNodeRenderer}
          formatError={formatError}
          showError={showError}
        >
          <SchemaNodeContextProvider
            key={tick}
            jsonSchema={jsonSchema}
            defaultValue={defaultValue}
            onChange={handleChange}
            onValidate={onValidate}
            onReady={handleReady}
            errors={errors}
            ajv={ajv}
          >
            {children || <SchemaNodeProxy path="" gridFrom={gridFrom} />}
          </SchemaNodeContextProvider>
        </SchemaNodeRendererContextProvider>
      </FormTypeInputsContextProvider>
    </UserDefinedContextProvider>
  );
};

export const Form = forwardRef(FormInner) as <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  props: FormProps<Schema, Value> & {
    ref?: ForwardedRef<FormHandle<Schema, Value>>;
  },
) => ReactNode;
