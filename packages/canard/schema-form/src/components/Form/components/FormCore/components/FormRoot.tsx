import {
  type ForwardedRef,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { getTrackableHandler } from '@winglet/common-utils/function';
import { useHandle, useLazyConstant } from '@winglet/react-utils/hook';

import { FieldNodeRequestType } from '@/schema-form/core';
import {
  FieldInputsContextProvider,
  FieldRendererContextProvider,
  InputControlContextProvider,
  RootNodeContextProvider,
  VirtualizationContextProvider,
  WorkspaceContextProvider,
} from '@/schema-form/providers';
import { useExternalFormContext } from '@/schema-form/providers/ExternalFormContext';
import {
  reportFailureToHost,
  useFormErrorContext,
} from '@/schema-form/providers/FormErrorContext';
import type { RootBinding } from '@/schema-form/providers/RootNodeContext';
import type { AttachedFilesMap } from '@/schema-form/types';

import type { FormHandle } from '../types/handle';
import type { FormProps } from '../types/props';
import { createChildren } from '../utils/createChildren';
import { findFirstInvalidNode } from '../utils/findFirstInvalidNode';
import { isShowErrorDisabled } from '../utils/isShowErrorDisabled';
import { reportSubmitFailure } from '../utils/reportSubmitFailure';
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
  const providerShowError = useExternalFormContext().showError;
  const loads = useRef(0);
  const mounted = useRef(false);
  const committed = useRef({
    showError,
    providerShowError,
    disabled: props.disabled,
    readOnly: props.readOnly,
  });
  useLayoutEffect(() => {
    committed.current = {
      showError,
      providerShowError,
      disabled: props.disabled,
      readOnly: props.readOnly,
    };
  });
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const onReset = useHandle(() => {
    loads.current++;
    setShowError(props.showError);
  });
  const submit = useHandle((native?: unknown) => {
    const isNative = native === true;
    const root = binding.current.root;
    const load = loads.current;
    const isCurrent = () => mounted.current && loads.current === load;
    return submitForm(
      root,
      props.onSubmit,
      (error) => reportSubmitFailure(reporter, error, isNative),
      isNative
        ? () => {
            const policy = committed.current;
            if (
              !isCurrent() ||
              isShowErrorDisabled(policy.showError ?? policy.providerShowError)
            )
              return;
            setShowError(true);
            // A React 18 legacy root commits the reveal synchronously; its layout effects may reset.
            if (!root || !isCurrent()) return;
            if (committed.current.disabled || committed.current.readOnly)
              return;
            findFirstInvalidNode(root)?.request(FieldNodeRequestType.Focus);
          }
        : undefined,
    );
  });
  const handleSubmit = useMemo(() => getTrackableHandler(submit), [submit]);
  const handleNativeSubmit = useCallback(
    async (event: SyntheticEvent) => {
      event.preventDefault();
      try {
        await handleSubmit(true);
      } catch (error) {
        reportFailureToHost(error);
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
      showError: (visible = true) =>
        setShowError(visible ? true : props.showError),
      submit: handleSubmit,
    }),
    [attachedFilesMap, binding, handleSubmit, props.showError],
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
