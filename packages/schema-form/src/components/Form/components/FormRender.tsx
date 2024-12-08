import { type ComponentType } from 'react';

import { useMemorize } from '@lumy-pack/common-react';

import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@/schema-form/components/SchemaNode';
import type { FormTypeRendererProps } from '@/schema-form/types';

export type FormRenderProps = {
  children: ComponentType<FormTypeRendererProps>;
} & Omit<SchemaNodeProxyProps, 'FormTypeRenderer'>;

export const FormRender = ({
  path,
  node,
  gridFrom,
  FormTypeInput: InputFormTypeInput,
  overridableFormTypeInputProps,
  Wrapper: InputWrapper,
  children,
}: FormRenderProps) => {
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(children);
  const Wrapper = useMemorize(InputWrapper);
  return (
    <SchemaNodeProxy
      path={path}
      node={node}
      gridFrom={gridFrom}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overridableFormTypeInputProps={overridableFormTypeInputProps}
      Wrapper={Wrapper}
    />
  );
};
