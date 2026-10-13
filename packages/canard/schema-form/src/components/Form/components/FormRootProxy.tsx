import { type PropsWithChildren, type SubmitEvent, memo } from 'react';

import type { Fn } from '@aileron/declare';

import { FieldProxy } from '@/schema-form/components/Field';

interface FormRootProxyProps {
  onSubmit: Fn<[SubmitEvent<HTMLFormElement>]>;
}

export const FormRootProxy = memo(
  ({ onSubmit, children }: PropsWithChildren<FormRootProxyProps>) => (
    <form onSubmit={onSubmit}>{children || <FieldProxy />}</form>
  ),
);
