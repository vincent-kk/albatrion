import {
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getTrackableHandler } from '@winglet/common-utils/function';
import { useHandle, useLazyConstant } from '@winglet/react-utils/hook';

import { SchemaNodeRequestType } from '@/schema-form/core';
import {
  FormTypeInputsContextProvider,
  FormTypeRendererContextProvider,
  InputControlContextProvider,
  RootNodeContextProvider,
  VirtualizationContextProvider,
  WorkspaceContextProvider,
} from '@/schema-form/providers';
import {
  reportErrorToHost,
  useFormErrorContext,
} from '@/schema-form/providers/FormErrorContext';
import type { RootBinding } from '@/schema-form/providers/RootNodeContext';
import type { AttachedFilesMap } from '@/schema-form/types';

import type { FormHandle, FormProps } from '../type';
import { createChildren } from '../util';
import { submitForm } from '../utils/submitForm';
import { FormRootProxy } from './FormRootProxy';

/** Compose the fixed provider hierarchy and expose the current binding through the handle. */
export const FormContents = (
  props: FormProps,
  ref: ForwardedRef<FormHandle>,
) => {
  const binding = useRef<RootBinding>({ reset: () => {} });
  const attachedFilesMap = useLazyConstant<AttachedFilesMap>(() => new Map());
  const reporter = useFormErrorContext();
  const [showError, setShowError] = useState(props.showError);
  const onReset = useHandle(() => setShowError(props.showError));
  const submit = useHandle((native = false) =>
    submitForm(
      binding.current.root,
      props.onSubmit,
      native ? (error) => reporter?.capture(error) : undefined,
    ),
  );
  const handleSubmit = useMemo(() => getTrackableHandler(submit), [submit]);
  useImperativeHandle(
    ref,
    () => ({
      get node() {
        return binding.current.root;
      },
      focus: (path) =>
        binding.current.root?.find(path)?.request(SchemaNodeRequestType.Focus),
      select: (path) =>
        binding.current.root?.find(path)?.request(SchemaNodeRequestType.Select),
      refresh: (path) =>
        binding.current.root
          ?.find(path)
          ?.request(SchemaNodeRequestType.Refresh),
      remount: (path) =>
        binding.current.root
          ?.find(path)
          ?.request(SchemaNodeRequestType.Remount),
      reset: (option) => binding.current.reset(option),
      findNode: (path) => binding.current.root?.find(path) ?? null,
      findNodes: (path) => binding.current.root?.findNodes(path) ?? [],
      getState: () => binding.current.root?.globalState ?? {},
      setState: (state) => binding.current.root?.setSubtreeState(state),
      clearState: () => binding.current.root?.clearSubtreeState(),
      getValue: () => binding.current.root?.outputValue,
      setValue: (value, options) =>
        binding.current.root?.setValue(value, options),
      getErrors: () => binding.current.root?.globalErrors ?? [],
      getAttachedFilesMap: () => attachedFilesMap,
      validate: async () => (await binding.current.root?.validate()) ?? [],
      showError: (visible = true) =>
        setShowError(visible ? true : props.showError),
      submit: handleSubmit,
    }),
    [attachedFilesMap, handleSubmit, props.showError],
  );
  const children = useMemo(
    () => createChildren(props.children, props.jsonSchema),
    [props.children, props.jsonSchema],
  );
  return (
    <WorkspaceContextProvider
      attachedFilesMap={attachedFilesMap}
      context={props.context}
    >
      <FormTypeInputsContextProvider
        formTypeInputDefinitions={props.formTypeInputDefinitions}
        formTypeInputMap={props.formTypeInputMap}
      >
        <FormTypeRendererContextProvider
          FormTypeGroupRenderer={props.FormTypeGroupRenderer}
          FormTypeLabelRenderer={props.FormTypeLabelRenderer}
          FormTypeInputRenderer={props.FormTypeInputRenderer}
          FormTypeErrorRenderer={props.FormTypeErrorRenderer}
          formatError={props.formatError}
          showError={showError}
        >
          <InputControlContextProvider
            readOnly={props.readOnly}
            disabled={props.disabled}
          >
            <VirtualizationContextProvider
              virtualization={props.virtualization}
            >
              <RootNodeContextProvider
                {...props}
                binding={binding}
                onReset={onReset}
              >
                <FormRootProxy
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      await handleSubmit(true);
                    } catch (error) {
                      reportErrorToHost(error);
                    }
                  }}
                >
                  {children}
                </FormRootProxy>
              </RootNodeContextProvider>
            </VirtualizationContextProvider>
          </InputControlContextProvider>
        </FormTypeRendererContextProvider>
      </FormTypeInputsContextProvider>
    </WorkspaceContextProvider>
  );
};
