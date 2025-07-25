import {
  type RefObject,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { noopFunction } from '@winglet/common-utils/constant';

import type { Fn } from '@aileron/declare';

import type { FormHandle } from '@/schema-form/components/Form';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

/**
 * Hook for handling form submission with pending state management.
 * Provides a submit function and pending state synchronized with the form's internal submit handler.
 * 
 * @example
 * ```typescript
 * const formRef = useRef<FormHandle<typeof schema>>(null);
 * const { submit, pending } = useFormSubmit(formRef);
 * 
 * // In component
 * <Form ref={formRef} jsonSchema={schema} onSubmit={handleSubmit} />
 * <button onClick={submit} disabled={pending}>
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
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  ref: RefObject<FormHandle<Schema, Value> | null>,
) => {
  const [subscribe, getSnapshot] = useMemo(
    () => [
      (onStoreChange: Fn) =>
        ref.current?.submit?.subscribe?.(onStoreChange) || noopFunction,
      () => ref?.current?.submit?.pending,
    ],
    [ref],
  );
  const pending = useSyncExternalStore(subscribe, getSnapshot);

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
