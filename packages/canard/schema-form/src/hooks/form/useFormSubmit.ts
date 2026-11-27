import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Fn, Nullable, Optional } from '@aileron/declare';

import type { FormHandle } from '@/schema-form/components/Form';
import type {
  AllowedValue,
  InferValueType,
  JSONSchema,
} from '@/schema-form/types';

/**
 * Hook for handling form submission with pending state management.
 * Provides a submit function and pending state synchronized with the form's internal submit handler.
 * Every subscription checks pending on attach, including Activity reconnects.
 * Each commit of the calling component re-subscribes when `ref.current.submit` has changed,
 * so a Form mounted after the hook, or remounted by key or error recovery, is tracked.
 *
 * @example
 * ```typescript
 * const formRef = useRef<FormHandle<typeof schema>>(null);
 * const { submit, pending } = useFormSubmit(formRef);
 * const handleClick = async () => {
 *   try {
 *     await submit();
 *   } catch (error) {
 *     // a ValidationError leaves the field errors on the form
 *     if (!isValidationError(error)) reportError(error);
 *   }
 * };
 *
 * <Form ref={formRef} jsonSchema={schema} onSubmit={handleSubmit} />
 * <button type="button" onClick={handleClick} disabled={pending}>
 *   {pending ? 'Submitting...' : 'Submit'}
 * </button>
 * ```
 *
 * @param ref - React ref to FormHandle instance
 * @returns Object containing submit function and pending state
 * @returns {Function} submit - Async function that triggers form submission
 * @returns {boolean | undefined} pending - Submission pending state
 */
export const useFormSubmit = <
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  ref: RefObject<Nullable<FormHandle<Schema, Value>>>,
) => {
  const [subscribe, getSnapshot, rebind] = useMemo(() => {
    let notify: Optional<Fn>;
    let target: Optional<FormHandle<Schema, Value>['submit']>;
    let unsubscribe: Fn = NOOP_FUNCTION;
    const bind = (onStoreChange: Fn) => {
      notify = onStoreChange;
      target = ref.current?.submit;
      unsubscribe = target?.subscribe?.(onStoreChange) || NOOP_FUNCTION;
      onStoreChange();
    };
    return [
      (onStoreChange: Fn) => {
        bind(onStoreChange);
        return () => {
          unsubscribe();
          notify = target = undefined;
          unsubscribe = NOOP_FUNCTION;
        };
      },
      () => ref?.current?.submit?.pending,
      // Ref assignment renders nothing, so each consumer commit checks for a new handle.
      () => {
        if (!notify || ref.current?.submit === target) return;
        unsubscribe();
        bind(notify);
      },
    ] as const;
  }, [ref]);
  const pending = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(rebind);

  const submit = useCallback(() => {
    const handler = ref.current?.submit;
    if (!handler) return Promise.resolve(void 0);
    return handler();
  }, [ref]);

  return useMemo(
    () => ({
      submit,
      pending,
    }),
    [pending, submit],
  );
};
