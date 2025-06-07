import {
  type RefObject,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { noopFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { FormHandle } from '@/schema-form/components/Form';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

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
    [ref.current],
  );
  const pending = useSyncExternalStore(subscribe, getSnapshot);

  const submit = useCallback(() => {
    const handler = ref.current?.submit;
    if (!handler) return Promise.resolve(void 0);
    return handler();
  }, [ref.current]);

  return useMemo(
    () => ({
      submit,
      pending,
    }),
    [pending, submit],
  );
};
