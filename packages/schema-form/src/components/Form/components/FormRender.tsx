import type { ComponentType } from 'react';

import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export interface FormRenderProps
  extends Omit<SchemaNodeProxyProps, 'FormTypeRenderer'> {
  children: ComponentType<FormTypeRendererProps>;
}
export const FormRender = ({
  path,
  node,
  gridFrom,
  overrideFormTypeInputProps,
  FormTypeInput,
  Wrapper,
  children,
}: FormRenderProps) => (
  <SchemaNodeProxy
    path={path}
    node={node}
    gridFrom={gridFrom}
    overrideFormTypeInputProps={overrideFormTypeInputProps}
    FormTypeInput={FormTypeInput}
    Wrapper={Wrapper}
    FormTypeRenderer={children}
  />
);
