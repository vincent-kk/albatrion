import { type ComponentType, type PropsWithChildren } from 'react';

import { useMemorize, useSnapshot } from '@lumy-pack/common-react';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormGroupProps = {
  path: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & OverridableFormTypeInputProps;

export const FormGroup = ({
  path,
  FormTypeInput: InputFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
  ...restProps
}: FormGroupProps) => {
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
  const Wrapper = useMemorize(InputWrapper);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overridableFormTypeInputProps={overrideProps}
      Wrapper={Wrapper}
    />
  );
};
