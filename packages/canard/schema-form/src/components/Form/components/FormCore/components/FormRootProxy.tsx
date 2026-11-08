import {
  type PropsWithChildren,
  type Ref,
  type SubmitEvent,
  memo,
} from 'react';

import type { Fn } from '@aileron/declare';

import { FieldProxy } from '@/schema-form/components/FieldProxy';

interface FormRootProxyProps {
  /** Owned by FormRoot for pending focus guards; null without a virtualization manager. */
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
