import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary, Fn } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormRenderProps = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  children: Fn<[props: FormTypeRendererProps], ReactNode>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & OverridableFormTypeInputProps;

export const FormRender = ({
  path,
  FormTypeInput: InputFormTypeInput,
  Wrapper: InputWrapper,
  children,
  ...restProps
}: FormRenderProps) => {
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(children);
  const Wrapper = useMemorize(InputWrapper);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path ?? JSONPointer.Root}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overrideProps={overrideProps}
      Wrapper={Wrapper}
    />
  );
};
