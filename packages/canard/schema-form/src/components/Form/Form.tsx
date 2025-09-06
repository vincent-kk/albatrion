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

import { getTrackableHandler } from '@winglet/common-utils/function';
import { clone } from '@winglet/common-utils/object';
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
  WorkspaceContextProvider,
} from '@/schema-form/providers';
import type {
  AllowedValue,
  AttachedFileMap,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import type { FormHandle, FormProps } from './type';
import { createChildren } from './util';

const UPDATE_CHILDREN_MASK =
  NodeEventType.RequestRefresh | NodeEventType.UpdateError;

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
  const attachedFileMapRef = useRef<AttachedFileMap>(new Map());
  const [version, update] = useVersion(() => {
    ready.current = false;
    attachedFileMapRef.current.clear();
  });

  const jsonSchema = useMemorize(
    () => preprocessSchema(clone(inputJsonSchema)),
    [version],
  );
  const defaultValue = useMemorize(inputDefaultValue, [version]);

  const [rootNode, setRootNode] = useState<Node>();
  const [children, setChildren] = useState<ReactNode>(
    createChildren(inputChildren, jsonSchema),
  );
  const [showError, setShowError] = useState(inputShowError);

  const handleChange = useHandle((input: Parameter<typeof onChange>) => {
    if (!ready.current) return;
    onChange?.(input);
  });

  const handleValidate = useHandle(onValidate);

  const onSubmit = useHandle(async () => {
    if (!ready.current || !rootNode || inputOnSubmit === undefined) return;
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
    ready.current = true;
    setRootNode(rootNode);
    handleChange(rootNode.value as Value);
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
    () =>
      ({
        node: rootNode,
        focus: (path: string) =>
          rootNode?.find(path)?.publish(NodeEventType.RequestFocus),
        select: (path: string) =>
          rootNode?.find(path)?.publish(NodeEventType.RequestSelect),
        reset: update,
        getValue: () => rootNode?.value as Value,
        setValue: (value, options) => rootNode?.setValue(value as any, options),
        getErrors: () => rootNode?.globalErrors || [],
        getAttachedFileMap: () => attachedFileMapRef.current,
        validate: async () => (await rootNode?.validate()) || [],
        showError: (visible = true) =>
          visible ? setShowError(true) : setShowError(inputShowError),
        submit: handleSubmit,
      }) satisfies FormHandle<Schema, Value>,
    [rootNode, handleSubmit, update, inputShowError],
  );

  return (
    <WorkspaceContextProvider
      attachedFileMap={attachedFileMapRef.current}
      context={context}
    >
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
    </WorkspaceContextProvider>
  );
};

/**
 * Schema-driven form component that generates and manages forms based on JSON Schema.
 *
 * @typeParam Schema - The JSON Schema type that defines form structure
 * @typeParam Value - The inferred value type from the schema
 *
 * @example
 * Basic usage with automatic field generation:
 * ```tsx
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     username: { type: 'string', minLength: 3 },
 *     email: { type: 'string', format: 'email' },
 *     age: { type: 'number', minimum: 18 }
 *   },
 *   required: ['username', 'email']
 * };
 *
 * function MyForm() {
 *   const [value, setValue] = useState({});
 *   const formRef = useRef<FormHandle>();
 *
 *   const handleSubmit = async (data) => {
 *     await api.saveUser(data);
 *   };
 *
 *   return (
 *     <Form
 *       ref={formRef}
 *       jsonSchema={schema}
 *       onChange={setValue}
 *       onSubmit={handleSubmit}
 *       showError={ShowError.Touched}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Custom layout with composition:
 * ```tsx
 * <Form jsonSchema={schema} defaultValue={initialData}>
 *   <div className="form-section">
 *     <h3>Account Information</h3>
 *     <Form.Group path="/username" />
 *     <Form.Group path="/email" />
 *   </div>
 *   <div className="form-section">
 *     <h3>Personal Details</h3>
 *     <Form.Label path="/age" className="required" />
 *     <Form.Input path="/age" min={18} max={100} />
 *     <Form.Error path="/age" className="error-text" />
 *   </div>
 * </Form>
 * ```
 *
 * @example
 * Dynamic form with conditional fields:
 * ```tsx
 * <Form jsonSchema={schema}>
 *   {({ value, errors, node }) => (
 *     <>
 *       <Form.Input path="/accountType" />
 *       {value?.accountType === 'business' && (
 *         <>
 *           <Form.Input path="/companyName" />
 *           <Form.Input path="/taxId" />
 *         </>
 *       )}
 *       <button
 *         onClick={() => node?.validate()}
 *         disabled={errors?.length > 0}
 *       >
 *         Submit
 *       </button>
 *     </>
 *   )}
 * </Form>
 * ```
 *
 * @example
 * Using ref for imperative actions:
 * ```tsx
 * const formRef = useRef<FormHandle>();
 *
 * // Focus specific field
 * formRef.current?.focus('/email');
 *
 * // Validate programmatically
 * const errors = await formRef.current?.validate();
 *
 * // Set value with options
 * formRef.current?.setValue(
 *   { email: 'new@email.com' },
 *   { merge: true, validate: true }
 * );
 *
 * // Submit form programmatically
 * await formRef.current?.submit();
 * ```
 */
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
