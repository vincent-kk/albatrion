import {
  type PropsWithChildren,
  type Ref,
  type SubmitEvent,
  memo,
} from 'react';

import type { Fn } from '@aileron/declare';

import { FieldProxy } from '@/schema-form/components/FieldProxy';

interface FormRootProxyProps {
  /** Owned by FormRoot for pending focus guards; null while virtualization is inactive or unsupported. */
  formRef: Ref<HTMLFormElement>;
  onSubmit: Fn<[SubmitEvent<HTMLFormElement>]>;
  /** Runs the form-owned load after the browser restores native controls. */
  onReset: Fn<[React.SyntheticEvent<HTMLFormElement>]>;
}

export const FormRootProxy = memo(
  ({
    formRef,
    onSubmit,
    onReset,
    children,
  }: PropsWithChildren<FormRootProxyProps>) => (
    <form ref={formRef} onSubmit={onSubmit} onReset={onReset}>
      {children || <FieldProxy />}
    </form>
  ),
);
