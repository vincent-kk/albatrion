import { type ComponentType, type PropsWithChildren } from 'react';

import { useMemorize } from '@lumy-pack/common-react';

import {
  type GridForm,
  SchemaNodeProxy,
} from '@/schema-form/components/SchemaNode';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

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
  FormTypeInput: InputFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
  ...restProps
}: FormGroupProps) => {
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
  const overridableFormTypeInputProps = useMemorize(restProps);
  const Wrapper = useMemorize(InputWrapper);
  return (
    <SchemaNodeProxy
      path={path}
      gridFrom={gridFrom}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overridableFormTypeInputProps={overridableFormTypeInputProps}
      Wrapper={Wrapper}
    />
  );
};
