import {
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import {
  type InferSchemaNode,
  MethodType,
  type SchemaNode,
} from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';
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

import { FormHandle, FormProps } from './type';

const FormInner = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
>(
  {
    jsonSchema,
    defaultValue,
    onChange,
    onValidate,
    formTypeInputDefinitions,
    formTypeInputMap,
    CustomSchemaNodeRenderer,
    gridFrom,
    children,
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

  const handleChange = useHandle((input) => {
    if (isFunction(onChange)) {
      onChange(isFunction(input) ? input(rootNode?.value) : input);
    }
    update();
  });

  const childrenNode = useMemo(() => {
    if (!children) return null;

    if (isFunction(children)) {
      return children({
        jsonSchema,
        defaultValue,
        node: rootNode,
        value: rootNode?.value as Value,
        errors: rootNode?.errors || undefined,
        isArrayItem: rootNode?.isArrayItem,
      });
    }
    return children;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, rootNode, children, jsonSchema, defaultValue]);

  const handleReady = (rootNode: SchemaNode) => {
    setRootNode(rootNode as Node);
  };

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
        update();
      },
    }),
    [rootNode, update],
  );

  return (
    <UserDefinedContextProvider context={context}>
      <SchemaNodeContextProvider
        jsonSchema={jsonSchema}
        defaultValue={defaultValue}
        onChange={handleChange}
        onValidate={onValidate}
        onReady={handleReady}
        errors={errors}
        ajv={ajv}
      >
        <SchemaNodeRendererContextProvider
          CustomSchemaNodeRenderer={CustomSchemaNodeRenderer}
          formatError={formatError}
          showError={showError}
        >
          <FormTypeInputsContextProvider
            formTypeInputDefinitions={formTypeInputDefinitions}
            formTypeInputMap={formTypeInputMap}
          >
            {childrenNode || <SchemaNodeProxy path="" gridFrom={gridFrom} />}
          </FormTypeInputsContextProvider>
        </SchemaNodeRendererContextProvider>
      </SchemaNodeContextProvider>
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
