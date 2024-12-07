import type { ComponentType } from 'react';

import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy-form/components/SchemaNode';
import type { FormTypeRendererProps } from '@lumy-form/types';

export type FormRenderProps = {
  children: ComponentType<FormTypeRendererProps>;
} & Omit<SchemaNodeProxyProps, 'FormTypeRenderer'>;

export const FormRender = ({
  path,
  node,
  gridFrom,
  overridableFormTypeInputProps,
  FormTypeInput,
  Wrapper,
  children,
}: FormRenderProps) => (
  <SchemaNodeProxy
    path={path}
    node={node}
    gridFrom={gridFrom}
    FormTypeInput={FormTypeInput}
    FormTypeRenderer={children}
    overridableFormTypeInputProps={overridableFormTypeInputProps}
    Wrapper={Wrapper}
  />
);
