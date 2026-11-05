import {
  type PropsWithChildren,
  type Ref,
  type SubmitEvent,
  memo,
} from 'react';

import type { Fn } from '@aileron/declare';

import { FieldProxy } from '@/schema-form/components/FieldProxy';

interface FormRootProxyProps {
  /** Owned by FormRoot; locates the requesting form's document for pending focus guards. */
  formRef: Ref<HTMLFormElement>;
  onSubmit: Fn<[SubmitEvent<HTMLFormElement>]>;
}

export const FormRootProxy = memo(
  ({ formRef, onSubmit, children }: PropsWithChildren<FormRootProxyProps>) => (
    <form ref={formRef} onSubmit={onSubmit}>
      {children || <FieldProxy />}
    </form>
  ),
);
