import type { ComponentType, PropsWithChildren } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

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
  FormTypeInput,
  FormTypeRenderer,
  Wrapper,
  ...restProps
}: FormGroupProps) => {
  const overrideProps = useSnapshot(restProps);
  const constant = useConstant({
    FormTypeInput,
    FormTypeRenderer,
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
