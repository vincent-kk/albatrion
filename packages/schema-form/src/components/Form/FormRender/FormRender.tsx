import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import { FormTypeRenderer } from '@lumy/schema-form/components/SchemaNode/type';

export interface FormRenderProps
  extends Omit<SchemaNodeProxyProps, 'FormTypeRenderer'> {
  children: FormTypeRenderer;
}
export const FormRender = ({ path, children, ...rest }: FormRenderProps) => {
  return <SchemaNodeProxy path={path} {...rest} FormTypeRenderer={children} />;
};
