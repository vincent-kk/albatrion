import type { ComponentType, PropsWithChildren } from 'react';

import {
  type GridForm,
  SchemaNodeProxy,
} from '@lumy/schema-form/components/SchemaNode';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@lumy/schema-form/types';

export type FormGroupProps = {
  path: string;
  gridFrom?: GridForm;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & OverridableFormTypeInputProps;

export const FormGroup = ({
  path,
  gridFrom,
  FormTypeInput,
  FormTypeRenderer,
  Wrapper,
  ...overridableFormTypeInputProps
}: FormGroupProps) => (
  <SchemaNodeProxy
    path={path}
    gridFrom={gridFrom}
    FormTypeInput={FormTypeInput}
    FormTypeRenderer={FormTypeRenderer}
    overridableFormTypeInputProps={overridableFormTypeInputProps}
    Wrapper={Wrapper}
  />
);
