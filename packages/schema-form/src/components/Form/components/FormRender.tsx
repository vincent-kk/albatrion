import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import type { FormTypeRenderer } from '@lumy/schema-form/components/SchemaNode/type';

export interface FormRenderProps
  extends Omit<SchemaNodeProxyProps, 'FormTypeRenderer'> {
  children: FormTypeRenderer;
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
