import type { ComponentType, PropsWithChildren } from 'react';

import { JSONPath } from '@winglet/json-schema';
import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormRenderProps = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  children: ComponentType<FormTypeRendererProps>;
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
      path={path ?? JSONPath.Root}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overrideProps={overrideProps}
      Wrapper={Wrapper}
    />
  );
};
