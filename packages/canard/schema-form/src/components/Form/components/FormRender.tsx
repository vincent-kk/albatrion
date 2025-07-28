import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary, Fn } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
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
  FormTypeInput,
  Wrapper,
  children,
  ...restProps
}: FormRenderProps) => {
  const overrideProps = useSnapshot(restProps);
  const constant = useConstant({
    FormTypeInput,
    FormTypeRenderer: children,
    Wrapper,
  });
  return (
    <SchemaNodeProxy
      path={path}
      overrideProps={overrideProps}
      FormTypeInput={constant.FormTypeInput}
      FormTypeRenderer={constant.FormTypeRenderer}
      Wrapper={constant.Wrapper}
    />
  );
};
