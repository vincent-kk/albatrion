import {
  type PropsWithChildren,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { useHandle, useLazyConstant } from '@winglet/react-utils/hook';

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
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import { useExternalFormContext } from '../../ExternalFormContext';
import { useFormErrorContext } from '../../FormErrorContext';
import { useWorkspaceContext } from '../../WorkspaceContext';
import type { RootBinding, RootLoadProps, RootLoadStore } from '../type';
import { applyFormErrors } from '../utils/applyFormErrors';
import { createRootLoad } from '../utils/createRootLoad';
import { flushRootLoad } from '../utils/flushRootLoad';
import { reportRootLoadValidation } from '../utils/reportRootLoadValidation';
import { resetRootLoad } from '../utils/resetRootLoad';
import { subscribeRootLoad } from '../utils/subscribeRootLoad';
import { RootBindingContext } from './RootBindingContext';
import { RootNodeContext } from './RootNodeContext';

/** Validation mode applied when neither props nor the external form set one. */
const DEFAULT_VALIDATION_MODE =
  ValidationMode.OnChange | ValidationMode.OnRequest;

/** Own root construction, committed load lifetimes, and synchronous handle replacement. */
export const RootNodeContextProvider = ({
  children,
  binding,
  onReset,
  ...props
}: PropsWithChildren<
  FormProps & {
    binding: RefObject<RootBinding>;
    onReset: () => void;
  }
>) => {
  const external = useExternalFormContext();
  const { context, attachedFilesMap } = useWorkspaceContext();
  const reporter = useFormErrorContext();
  const current: RootLoadProps = {
    ...props,
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
  // Construction belongs to the speculative render; only committed loads are prepared.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Schema/default props are consumed again only by reset.
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
  if (reporter) {
    reporter.root = load.root;
    reporter.pendingLoad = () => flushRootLoad(load, true);
  }
  const pending =
    useRef<
      Optional<{
        props: RootLoadProps;
        option: Parameters<RootBinding['reset']>[0];
      }>
    >(undefined);
  const [, schedule] = useState(0);
  const reset = useHandle(
    (option?: Parameters<RootBinding['reset']>[0], rebuild = false) => {
      const used = committed.current;
      store.load = resetRootLoad(store.load, used, option, rebuild);
      store.unsubscribe();
      store.unsubscribe = subscribeRootLoad(store.load, store);
      binding.current.root = store.load.root;
      attachedFilesMap.clear();
      onReset();
      pending.current = { props: used, option };
      schedule((version) => version + 1);
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
    binding.current = { root: store.load.root, reset, rebuild };
    store.load.props = {
      ...store.load.props,
      onChange: current.onChange,
      onStateChange: current.onStateChange,
      onValidate: current.onValidate,
      onDiagnosticsChange: current.onDiagnosticsChange,
    };
    if (store.load.root && previous.context !== current.context)
      setContext(store.load.root, context);
    const requested = pending.current;
    pending.current = undefined;
    if (previous.validator !== current.validator) reset(requested?.option);
    else if (requested) {
      const { props: used, option } = requested;
      if (
        !isSameSchema(used.jsonSchema, current.jsonSchema) ||
        !isSameSchema(used.defaultValue, current.defaultValue) ||
        !isSameSchema(used.errors, current.errors) ||
        used.showError !== current.showError
      )
        reset(option);
    }
  });

  useLayoutEffect(() => {
    store.unsubscribe = subscribeRootLoad(load, store);
    load.ready = true;
    const root = load.root;
    const validator = load.props.validator;
    const authored = load.props.jsonSchema;
    if (root && validator) retainValidationRoot(validator, authored);
    if (!load.prepared) {
      load.prepared = true;
      flushRootLoad(load);
      if (root) {
        applyFormErrors(root, load.props.errors);
        if ((load.props.validationMode ?? 0) & ValidationMode.OnChange)
          void root
            .validate()
            .catch((error) => reporter?.capture(error, undefined, 'rejected'));
      }
    }
    return () => {
      load.ready = false;
      store.unsubscribe();
      if (root && validator) releaseValidationRoot(validator, authored);
    };
  }, [load, reporter, store]);

  const lastErrors = useRef(props.errors);
  useLayoutEffect(() => {
    if (load.root && lastErrors.current !== props.errors)
      applyFormErrors(load.root, props.errors, lastErrors.current);
    lastErrors.current = props.errors;
  }, [load, props.errors]);

  if (!load.root) return <div role="alert">Unable to load form.</div>;
  return (
    <RootBindingContext.Provider value={binding}>
      <RootNodeContext.Provider value={load.root}>
        {children}
      </RootNodeContext.Provider>
    </RootBindingContext.Provider>
  );
};
