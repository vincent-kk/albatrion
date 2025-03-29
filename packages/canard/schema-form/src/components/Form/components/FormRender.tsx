import type { ComponentType } from 'react';

import { JSONPath } from '@winglet/json-schema';
import { useMemorize } from '@winglet/react-utils';

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
      path={path ?? JSONPath.Root}
      node={node}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overridableFormTypeInputProps={overridableFormTypeInputProps}
      Wrapper={Wrapper}
    />
  );
};
