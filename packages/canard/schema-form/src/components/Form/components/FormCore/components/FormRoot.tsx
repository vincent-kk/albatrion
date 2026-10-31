import {
  type ForwardedRef,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { getTrackableHandler } from '@winglet/common-utils/function';
import { useHandle, useLazyConstant } from '@winglet/react-utils/hook';

import {
  FieldNodeRequestType,
  recordFieldNodeShowErrorBaseline,
} from '@/schema-form/core';
import {
  FieldInputsContextProvider,
  FieldRendererContextProvider,
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

import type { FormHandle } from '../types/handle';
import type { FormProps } from '../types/props';
import { createChildren } from '../utils/createChildren';
import { submitForm } from '../utils/submitForm';
import { FormRootProxy } from './FormRootProxy';

/** Compose the fixed provider hierarchy and expose the current binding through the handle. */
export const FormRoot = (props: FormProps, ref: ForwardedRef<FormHandle>) => {
  const binding = useLazyConstant<RefObject<RootBinding>>(() => ({
    current: { reset: NOOP_FUNCTION, rebuild: NOOP_FUNCTION },
  }));
  const attachedFilesMap = useLazyConstant<AttachedFilesMap>(() => new Map());
  const reporter = useFormErrorContext();
  const [showError, setShowError] = useState(props.showError);
  const onReset = useHandle(() => setShowError(props.showError));
  const handleShowError = useHandle((visible = true) => {
    if (binding.current.root)
      recordFieldNodeShowErrorBaseline(binding.current.root, showError);
    setShowError(visible ? true : props.showError);
  });
  const submit = useHandle((native = false) =>
    submitForm(
      binding.current.root,
      props.onSubmit,
      native ? (error) => reporter?.capture(error) : undefined,
    ),
  );
  const handleSubmit = useMemo(() => getTrackableHandler(submit), [submit]);
  const handleNativeSubmit = useCallback(
    async (event: SyntheticEvent) => {
      event.preventDefault();
      try {
        await handleSubmit(true);
      } catch (error) {
        reportErrorToHost(error);
      }
    },
    [handleSubmit],
  );
  useImperativeHandle(
    ref,
    () => ({
      get node() {
        return binding.current.root;
      },
      focus: (path) =>
        binding.current.root?.find(path)?.request(FieldNodeRequestType.Focus),
      select: (path) =>
        binding.current.root?.find(path)?.request(FieldNodeRequestType.Select),
      refresh: (path) =>
        binding.current.root?.find(path)?.request(FieldNodeRequestType.Refresh),
      remount: (path) =>
        binding.current.root?.find(path)?.request(FieldNodeRequestType.Remount),
      reset: (option) => binding.current.reset(option),
      rebuild: (option) => binding.current.rebuild(option),
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
      showError: handleShowError,
      submit: handleSubmit,
    }),
    [
      attachedFilesMap,
      binding,
      handleSubmit,
      handleShowError,
      props.showError,
      showError,
    ],
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
      <FieldInputsContextProvider
        fieldInputDefinitions={props.fieldInputDefinitions}
        fieldInputMap={props.fieldInputMap}
      >
        <FieldRendererContextProvider
          FieldRenderer={props.FieldRenderer}
          FormLabelRenderer={props.FormLabelRenderer}
          FormInputRenderer={props.FormInputRenderer}
          FormErrorRenderer={props.FormErrorRenderer}
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
                <FormRootProxy onSubmit={handleNativeSubmit}>
                  {children}
                </FormRootProxy>
              </RootNodeContextProvider>
            </VirtualizationContextProvider>
          </InputControlContextProvider>
        </FieldRendererContextProvider>
      </FieldInputsContextProvider>
    </WorkspaceContextProvider>
  );
};
