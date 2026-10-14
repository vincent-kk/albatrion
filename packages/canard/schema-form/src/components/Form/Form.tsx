import { type ForwardedRef, type ReactNode, forwardRef, memo } from 'react';

import { withErrorBoundaryForwardRef } from '@winglet/react-utils/hoc';

import {
  FormErrorContextProvider,
  useBoundaryReporter,
} from '@/schema-form/providers/FormErrorContext';
import type {
  AllowedValue,
  InferValueType,
  JSONSchema,
} from '@/schema-form/types';

import { FormContents } from './components/FormContents';
import type { FormHandle, FormProps } from './type';

/** Root boundary is inside the instance reporter so fallback does not retire reporting. */
const BoundedForm = withErrorBoundaryForwardRef(
  forwardRef(FormContents),
  undefined,
  useBoundaryReporter,
);

/** Render a schema-driven form with an instance reporter and current-root imperative handle. */
export const Form = memo(
  forwardRef<FormHandle, FormProps>((props, ref) => (
    <FormErrorContextProvider onError={props.onError}>
      <BoundedForm {...props} ref={ref} />
    </FormErrorContextProvider>
  )),
) as <
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  props: FormProps<Schema, Value> & {
    ref?: ForwardedRef<FormHandle<Schema, Value>>;
  },
) => ReactNode;
