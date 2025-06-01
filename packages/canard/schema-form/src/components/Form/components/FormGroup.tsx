import type { ComponentType, PropsWithChildren } from 'react';

import { JSONPath } from '@winglet/json';
import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormGroupProps = {
  path?: string;
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
      path={path ?? JSONPath.Root}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overrideProps={overrideProps}
      Wrapper={Wrapper}
    />
  );
};
