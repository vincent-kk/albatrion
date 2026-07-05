import { type PropsWithChildren, type SubmitEvent, memo } from 'react';

import type { Fn } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';

interface FormRootProxyProps {
  onSubmit: Fn<[SubmitEvent<HTMLFormElement>]>;
}

export const FormRootProxy = memo(
  ({ onSubmit, children }: PropsWithChildren<FormRootProxyProps>) => (
    <form onSubmit={onSubmit}>{children || <SchemaNodeProxy />}</form>
  ),
);
