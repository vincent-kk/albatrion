import {
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from 'react';

import { isFunction } from '@lumy-pack/common';
import { useConstant, useHandle, useTick } from '@lumy-pack/common-react';

import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode';
import {
  type InferSchemaNode,
  MethodType,
  type SchemaNode,
  isObjectNode,
} from '@lumy/schema-form/core';
import {
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
  SchemaNodeContextProvider,
  UserDefinedContextProvider,
} from '@lumy/schema-form/providers';
import {
  type AllowedValue,
  type InferValueType,
  type JsonSchema,
  type ObjectValue,
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
    defaultValue: defaultValueInput,
    onChange,
    onValidate,
    formTypeInputDefinitions,
    formTypeInputMap,
    errors,
    CustomFormTypeRenderer,
    formatError,
    showError = ShowError.Dirty | ShowError.Touched,
    gridFrom,
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
  const [tick, update] = useTick();

  const handleChange = useHandle((input: Parameter<typeof onChange>) => {
    if (isFunction(onChange))
      onChange(
        (isFunction(input) ? input(rootNode?.value as Value) : input) as Value,
      );
  });

  const handleValidate = useHandle((errors: Parameter<typeof onValidate>) => {
    if (isFunction(onValidate)) onValidate(errors);
  });

  const handleReady = useHandle((rootNode: SchemaNode) => {
    setRootNode(rootNode as Node);
  });

  useLayoutEffect(() => {
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
          type: MethodType.Focus,
        }),
      select: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish({
          type: MethodType.Select,
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
          <SchemaNodeContextProvider
            key={tick}
            jsonSchema={jsonSchema}
            defaultValue={defaultValue}
            onChange={handleChange}
            onValidate={handleValidate}
            onReady={handleReady}
            errors={errors}
            ajv={ajv}
          >
            {children || <SchemaNodeProxy path="" gridFrom={gridFrom} />}
          </SchemaNodeContextProvider>
        </FormTypeRendererContextProvider>
      </FormTypeInputsContextProvider>
    </UserDefinedContextProvider>
  );
};

export const Form = memo(forwardRef(FormInner)) as <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  props: FormProps<Schema, Value> & {
    ref?: ForwardedRef<FormHandle<Schema, Value>>;
  },
) => ReactNode;
