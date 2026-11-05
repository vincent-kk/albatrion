import {
  type PropsWithChildren,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import {
  useHandle,
  useLazyConstant,
  useVersion,
} from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';

import { blueprintCacheDomain } from '@/schema-form/app/cache';
import { PluginManager } from '@/schema-form/app/plugin';
import type { FormProps } from '@/schema-form/components/Form';
import {
  ValidationMode,
  releaseValidationRoot,
  retainValidationRoot,
  setContext,
} from '@/schema-form/core';
import type { SchemaFormError } from '@/schema-form/errors';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import { useExternalFormContext } from '../../ExternalFormContext';
import { useFieldInputsContext } from '../../FieldInputsContext';
import { useFieldRendererContext } from '../../FieldRendererContext';
import { useFormErrorContext } from '../../FormErrorContext';
import { useWorkspaceContext } from '../../WorkspaceContext';
import type { RootBinding, RootLoadProps, RootLoadStore } from '../type';
import { applyFormErrors } from '../utils/applyFormErrors';
import { commitRootLoadSettings } from '../utils/commitRootLoadSettings';
import { createRootLoad } from '../utils/createRootLoad';
import { flushRootLoad } from '../utils/flushRootLoad';
import { reportRootLoadValidation } from '../utils/reportRootLoadValidation';
import { resetRootLoad } from '../utils/resetRootLoad';
import { scheduleLoadValidation } from '../utils/scheduleLoadValidation';
import { subscribeRootLoad } from '../utils/subscribeRootLoad';
import { RootBindingContext } from './RootBindingContext';
import { RootNodeContext } from './RootNodeContext';

/** Validation mode applied when neither props nor the external form set one. */
const DEFAULT_VALIDATION_MODE =
  ValidationMode.OnChange | ValidationMode.OnRequest;

/** Own root construction and handle replacement; React commits props before recovery in layout-effect declaration order. */
export const RootNodeContextProvider = ({
  children,
  binding,
  onReset,
  errorVisibilityError,
  ...props
}: PropsWithChildren<
  FormProps & {
    binding: RefObject<RootBinding>;
    onReset: () => void;
    errorVisibilityError?: SchemaFormError;
  }
>) => {
  const external = useExternalFormContext();
  const { context, attachedFilesMap } = useWorkspaceContext();
  const reporter = useFormErrorContext();
  const { inputMapError } = useFieldInputsContext();
  const { errorVisibility } = useFieldRendererContext();
  const current: RootLoadProps = {
    ...props,
    inputMapError,
    errorVisibilityError,
    context,
    validator:
      props.validatorFactory ??
      external.validatorFactory ??
      PluginManager.validator,
    validationMode:
      props.validationMode ??
      external.validationMode ??
      DEFAULT_VALIDATION_MODE,
  };
  const committed = useRef(current);
  const committedPolicy = useRef(errorVisibility);
  // Construction belongs to the speculative render; only committed loads are prepared.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Initial construction is speculative; later configuration changes commit below.
  const initial = useMemo(() => createRootLoad(current, reporter), []);
  const store = useLazyConstant<RootLoadStore>(() => ({
    load: initial,
    listeners: new Set<() => void>(),
    unsubscribe: NOOP_FUNCTION,
  }));
  const subscribe = useMemo(
    () => (listener: () => void) => {
      store.listeners.add(listener);
      return () => {
        store.listeners.delete(listener);
      };
    },
    [store],
  );
  const getSnapshot = useMemo(() => () => store.load, [store]);
  const load = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const reportedPolicyError = useRef<SchemaFormError>(undefined);
  const reportedMapError = useRef<SchemaFormError>(undefined);
  if (reporter) {
    reporter.root = load.root;
    reporter.pendingLoad = () => flushRootLoad(load, true);
  }
  const pending = useRef<
    Optional<{
      props: RootLoadProps;
      option: Parameters<RootBinding['reset']>[0];
    }>
  >(undefined);
  const [, update] = useVersion();
  const reset = useHandle(
    (option?: Parameters<RootBinding['reset']>[0], rebuild = false) => {
      const used = committed.current;
      commitRootLoadSettings(store.load, store, used, committedPolicy.current);
      store.load = resetRootLoad(store.load, used, option, rebuild);
      store.unsubscribe();
      store.unsubscribe = subscribeRootLoad(store.load, store);
      if (store.load.root) scheduleLoadValidation(store.load, store);
      binding.current.root = store.load.root;
      attachedFilesMap.clear();
      onReset();
      pending.current = { props: used, option };
      update();
      for (const listener of store.listeners) listener();
      try {
        if (
          store.load.root &&
          !store.load.root.globalErrors.length &&
          store.lastReportedErrors?.length
        )
          reportRootLoadValidation(store.load, store);
      } catch (error) {
        throw store.load.error || error;
      }
      if (store.load.error) throw store.load.error;
    },
  );

  const rebuild = useHandle(
    (option?: Parameters<RootBinding['rebuild']>[0]) => {
      const schema = committed.current.jsonSchema;
      if (schema !== null && typeof schema === 'object')
        blueprintCacheDomain.invalidate(schema);
      reset(option, true);
    },
  );

  useLayoutEffect(() => {
    const previous = committed.current;
    committed.current = current;
    committedPolicy.current = errorVisibility;
    binding.current = { root: store.load.root, reset, rebuild };
    store.load.props = {
      ...store.load.props,
      onChange: current.onChange,
      onStateChange: current.onStateChange,
      onValidate: current.onValidate,
      onDiagnosticsChange: current.onDiagnosticsChange,
    };
    const requested = pending.current;
    pending.current = undefined;
    const configurationRecovered =
      (previous.errorVisibilityError || previous.inputMapError) &&
      !errorVisibilityError &&
      !inputMapError;
    const validatorChanged =
      previous.validator !== current.validator ||
      (configurationRecovered &&
        store.load.props.validator !== current.validator);
    const configurationBlockedLoad =
      !store.load.root &&
      (store.load.props.errorVisibilityError || store.load.props.inputMapError);
    if (
      !errorVisibilityError &&
      !inputMapError &&
      !configurationBlockedLoad &&
      validatorChanged
    )
      reset(requested?.option);
    else if (requested) {
      const { props: used, option } = requested;
      if (
        !isSameSchema(used.jsonSchema, current.jsonSchema) ||
        !isSameSchema(used.defaultValue, current.defaultValue) ||
        !isSameSchema(used.errors, current.errors)
      )
        reset(option);
    }
    const active = store.load;
    const root = active.root;
    commitRootLoadSettings(active, store, current, errorVisibility);
    if (root && store.load === active && previous.context !== current.context)
      setContext(root, context);
  });

  useLayoutEffect(() => {
    if (
      errorVisibilityError &&
      reportedPolicyError.current !== errorVisibilityError &&
      load.error !== errorVisibilityError
    )
      flushRootLoad({
        props: committed.current,
        root: store.load.root,
        error: errorVisibilityError,
        records: [],
        prepared: true,
        reporter,
      });
    reportedPolicyError.current = errorVisibilityError;
    if (
      inputMapError &&
      reportedMapError.current !== inputMapError &&
      load.error !== inputMapError
    )
      flushRootLoad({
        props: committed.current,
        root: store.load.root,
        error: inputMapError,
        records: [],
        prepared: true,
        reporter,
      });
    reportedMapError.current = inputMapError;
    if (
      !errorVisibilityError &&
      !inputMapError &&
      !store.load.root &&
      (store.load.props.errorVisibilityError || store.load.props.inputMapError)
    ) {
      store.load.retired = true;
      reporter?.beginLoad();
      store.load = createRootLoad(committed.current, reporter);
      binding.current.root = store.load.root;
      onReset();
      update();
      for (const listener of store.listeners) listener();
    }
  }, [
    inputMapError,
    errorVisibilityError,
    load.error,
    store,
    reporter,
    binding,
    onReset,
    update,
  ]);

  useLayoutEffect(() => {
    const root = load.root;
    const validator = load.props.validator;
    const authored = load.props.jsonSchema;
    if (root && validator) retainValidationRoot(validator, authored);
    if (!load.prepared) {
      if (store.load === load) {
        store.unsubscribe();
        store.unsubscribe = subscribeRootLoad(load, store);
        load.prepared = true;
        flushRootLoad(load);
        if (root) {
          applyFormErrors(root, load.props.errors, undefined, 'load');
          scheduleLoadValidation(load, store);
        }
      } else load.prepared = true;
    }
    return () => {
      if (root && validator) releaseValidationRoot(validator, authored);
    };
  }, [load, reporter, store]);

  const lastErrors = useRef(props.errors);
  useLayoutEffect(() => {
    const root = store.load.root;
    if (root && lastErrors.current !== props.errors)
      applyFormErrors(root, props.errors, lastErrors.current);
    lastErrors.current = props.errors;
  }, [load, props.errors, store]);

  if (!load.root) return <div role="alert">Unable to load form.</div>;
  return (
    <RootBindingContext.Provider value={binding}>
      <RootNodeContext.Provider value={load.root}>
        {children}
      </RootNodeContext.Provider>
    </RootBindingContext.Provider>
  );
};
