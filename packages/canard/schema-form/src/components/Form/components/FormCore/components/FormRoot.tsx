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

import {
  type FieldNode,
  FieldNodeRequestType,
  readFieldNodeValidationEpoch,
} from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';
import { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle';
import { VirtualizationManager } from '@/schema-form/helpers/virtualization';
import {
  FieldInputsContextProvider,
  FieldLifecycleContext,
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
import { ErrorVisibility } from '@/schema-form/types';

import type { FormHandle } from '../types/handle';
import type { FormProps } from '../types/props';
import { FocusRequest } from '../utils/FocusRequest';
import { createChildren } from '../utils/createChildren';
import { findFirstInvalidNode } from '../utils/findFirstInvalidNode';
import { focusFieldNode } from '../utils/focusFieldNode';
import { reportSubmitFailure } from '../utils/reportSubmitFailure';
import { resolveErrorVisibilityPolicy } from '../utils/resolveErrorVisibilityPolicy';
import { submitForm } from '../utils/submitForm';
import { FormRootProxy } from './FormRootProxy';

/** Compose the fixed provider hierarchy and expose the current binding through the handle. */
export const FormRoot = (props: FormProps, ref: ForwardedRef<FormHandle>) => {
  const formRef = useRef<HTMLFormElement>(null);
  const binding = useLazyConstant<RefObject<RootBinding>>(() => ({
    current: { reset: NOOP_FUNCTION, rebuild: NOOP_FUNCTION },
  }));
  const attachedFilesMap = useLazyConstant<AttachedFilesMap>(() => new Map());
  const reporter = useFormErrorContext();
  const reportLifecycleError = useHandle((error: unknown, node: FieldNode) => {
    let message: string;
    try {
      message = error instanceof Error ? error.message : String(error);
    } catch {
      message = 'Field lifecycle handler threw an unstringifiable value';
    }
    try {
      reporter?.report({
        level: 'error',
        code: FormErrorCode.ListenerThrew,
        origin: 'render',
        message,
        path: node.path,
        error,
      });
    } catch (failure) {
      try {
        reportFailureToHost(failure);
      } catch {
        /* Both reporting paths failed; no further sink can preserve queue isolation. */
      }
    }
  });
  const lifecycle = useLazyConstant(
    () => new FieldLifecycleRegistry(reportLifecycleError),
  );
  const providerErrorVisibility = useExternalFormContext().errorVisibility;
  const inputPolicy = props.errorVisibility ?? providerErrorVisibility;
  const resolvedPolicy = useMemo(
    () => resolveErrorVisibilityPolicy(inputPolicy),
    [inputPolicy],
  );
  // Mount-time options remain fixed so already mounted fields never regress to placeholders.
  const virtualization = useLazyConstant(() => ({
    manager: VirtualizationManager.create(props.virtualization),
  }));
  const loads = useRef(0);
  const focusRequest = useRef<FocusRequest>(undefined);
  const focusNode = useHandle((target: FieldNode | null | undefined) => {
    focusRequest.current?.cancel();
    const load = loads.current;
    const root = binding.current.root;
    const request = new FocusRequest(
      () => loads.current === load && binding.current.root === root,
    );
    focusRequest.current = request;
    focusFieldNode(
      target,
      formRef.current,
      virtualization.manager,
      lifecycle,
      request,
    );
  });
  const policyGeneration = useRef(0);
  const mounted = useRef(false);
  const committed = useRef({
    errorVisibility: ErrorVisibility.AfterEditAndTouch,
    disabled: props.disabled,
    readOnly: props.readOnly,
    onSubmit: props.onSubmit,
  });
  const policyError =
    typeof resolvedPolicy === 'string' ? undefined : resolvedPolicy;
  const basePolicy =
    typeof resolvedPolicy === 'string'
      ? resolvedPolicy
      : committed.current.errorVisibility;
  const [reveal, setReveal] = useState<{
    base: ErrorVisibility;
    load: number;
    generation: number;
  }>();
  const errorVisibility =
    reveal?.base === basePolicy &&
    reveal.load === loads.current &&
    reveal.generation === policyGeneration.current
      ? ErrorVisibility.Always
      : basePolicy;
  useLayoutEffect(() => {
    if (committed.current.errorVisibility !== basePolicy)
      policyGeneration.current++;
    committed.current = {
      errorVisibility: basePolicy,
      disabled: props.disabled,
      readOnly: props.readOnly,
      onSubmit: props.onSubmit,
    };
    if (
      reveal &&
      (reveal.base !== basePolicy ||
        reveal.load !== loads.current ||
        reveal.generation !== policyGeneration.current)
    )
      setReveal(undefined);
  }, [basePolicy, props.disabled, props.readOnly, props.onSubmit, reveal]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (!mounted.current) focusRequest.current?.cancel();
      });
    };
  }, []);
  const onReset = useCallback(() => {
    focusRequest.current?.cancel();
    loads.current++;
    setReveal(undefined);
  }, []);
  const revealErrors = useCallback(() => {
    const base = committed.current.errorVisibility;
    const load = loads.current;
    const generation = policyGeneration.current;
    setReveal((previous) =>
      previous?.base === base &&
      previous.load === load &&
      previous.generation === generation
        ? previous
        : { base, load, generation },
    );
  }, []);
  const resetErrorVisibility = useCallback(() => setReveal(undefined), []);
  const captureValidationLifetime = useCallback(() => {
    const root = binding.current.root;
    const epoch = root ? readFieldNodeValidationEpoch(root) : undefined;
    return () =>
      binding.current.root === root &&
      (!root || readFieldNodeValidationEpoch(root) === epoch);
  }, [binding]);
  const submit = useCallback(
    (native?: unknown) => {
      const isNative = native === true;
      const root = binding.current.root;
      const load = loads.current;
      const isCurrentValidation = captureValidationLifetime();
      const isCurrent = () =>
        mounted.current && loads.current === load && isCurrentValidation();
      return submitForm(
        root,
        committed.current.onSubmit,
        (error) => {
          if (isCurrentValidation())
            reportSubmitFailure(reporter, error, isNative);
        },
        isNative
          ? () => {
              const policy = committed.current;
              if (
                !isCurrent() ||
                policy.errorVisibility === ErrorVisibility.Never
              )
                return;
              revealErrors();
              // A React 18 legacy root commits the reveal synchronously; its layout effects may reset.
              if (!root || !isCurrent()) return;
              if (
                committed.current.errorVisibility === ErrorVisibility.Never ||
                committed.current.disabled ||
                committed.current.readOnly
              )
                return;
              focusNode(findFirstInvalidNode(root));
            }
          : undefined,
      );
    },
    [binding, captureValidationLifetime, focusNode, reporter, revealErrors],
  );
  const handleSubmit = useMemo(() => getTrackableHandler(submit), [submit]);
  const handleNativeSubmit = useCallback(
    async (event: SyntheticEvent) => {
      event.preventDefault();
      const isCurrent = captureValidationLifetime();
      try {
        await handleSubmit(true);
      } catch (error) {
        if (isCurrent()) reportFailureToHost(error);
      }
    },
    [handleSubmit, captureValidationLifetime],
  );
  useImperativeHandle(
    ref,
    () => ({
      get node() {
        return binding.current.root;
      },
      focus: (path) => focusNode(binding.current.root?.find(path)),
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
      revealErrors,
      resetErrorVisibility,
      submit: handleSubmit,
    }),
    [
      attachedFilesMap,
      binding,
      focusNode,
      handleSubmit,
      revealErrors,
      resetErrorVisibility,
    ],
  );
  const children = useMemo(
    () => createChildren(props.children),
    [props.children],
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
          errorVisibility={errorVisibility}
        >
          <InputControlContextProvider
            readOnly={props.readOnly}
            disabled={props.disabled}
          >
            <VirtualizationContextProvider value={virtualization}>
              <FieldLifecycleContext.Provider value={lifecycle}>
                <RootNodeContextProvider
                  {...props}
                  binding={binding}
                  onReset={onReset}
                  errorVisibilityError={policyError}
                >
                  <FormRootProxy
                    formRef={formRef}
                    onSubmit={handleNativeSubmit}
                  >
                    {children}
                  </FormRootProxy>
                </RootNodeContextProvider>
              </FieldLifecycleContext.Provider>
            </VirtualizationContextProvider>
          </InputControlContextProvider>
        </FieldRendererContextProvider>
      </FieldInputsContextProvider>
    </WorkspaceContextProvider>
  );
};
