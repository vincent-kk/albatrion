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
  useTick,
  withErrorBoundaryForwardRef,
} from '@winglet/react-utils';

import type { Fn, Parameter } from '@aileron/types';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import {
  type InferSchemaNode,
  NodeMethod,
  type SchemaNode,
  isObjectNode,
} from '@/schema-form/core';
import {
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
  RootNodeContextProvider,
  UserDefinedContextProvider,
} from '@/schema-form/providers';
import {
  type AllowedValue,
  type InferValueType,
  type JsonSchema,
  type ObjectValue,
  ShowError,
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
    onChange,
    onValidate,
    formTypeInputDefinitions,
    formTypeInputMap,
    errors,
    CustomFormTypeRenderer,
    formatError,
    showError = ShowError.Dirty | ShowError.Touched,
    readOnly,
    disabled,
    ajv,
    context,
    children: childrenInput,
  }: FormProps<Schema, Value>,
  ref: ForwardedRef<FormHandle<Schema, Value, Node>>,
) => {
  const jsonSchema = useConstant(() => {
    if (readOnly) jsonSchemaInput.readOnly = readOnly;
    if (disabled) jsonSchemaInput.disabled = disabled;
    return jsonSchemaInput;
  });
  const [rootNode, setRootNode] = useState<Node>();
  const [children, setChildren] = useState<ReactNode>(
    createChildren(childrenInput, jsonSchema),
  );
  const initialDefaultValue = useConstant(defaultValueInput);
  const [defaultValue, setDefaultValue] = useState<Value | undefined>(
    initialDefaultValue,
  );
  const [tick, update] = useTick(() => {
    ready.current = false;
  });

  const ready = useRef(false);

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
      if (type === NodeMethod.Validate || type === NodeMethod.Redraw)
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
          type: NodeMethod.Focus,
        }),
      select: (dataPath: string) =>
        rootNode?.findNode(dataPath)?.publish({
          type: NodeMethod.Select,
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
          <RootNodeContextProvider
            key={tick}
            jsonSchema={jsonSchema}
            defaultValue={defaultValue}
            onChange={handleChange}
            onValidate={handleValidate}
            onReady={handleReady}
            errors={errors}
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
