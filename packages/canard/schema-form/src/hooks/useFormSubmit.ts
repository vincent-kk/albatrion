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

const EMPTY_STATE = Object.freeze({ loading: false });

export const useFormSubmit = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  ref: RefObject<FormHandle<Schema, Value>>,
) => {
  const [subscribe, getSnapshot] = useMemo(
    () => [
      (onStoreChange: Fn) =>
        ref.current?.submit?.subscribe?.(onStoreChange) || noopFunction,
      () => ref.current?.submit?.state || EMPTY_STATE,
    ],
    [],
  );
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const submit = useCallback(() => {
    const handler = ref.current?.submit;
    if (!handler) return Promise.resolve(void 0);
    return handler();
  }, []);

  return useMemo(
    () => ({
      ...state,
      submit,
    }),
    [state, submit],
  );
};
