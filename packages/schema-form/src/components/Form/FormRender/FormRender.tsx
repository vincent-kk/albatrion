import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import { SchemaNodeRenderer } from '@lumy/schema-form/components/SchemaNode/type';

export interface FormRenderProps
  extends Omit<SchemaNodeProxyProps, 'SchemaNodeRenderer'> {
  children: SchemaNodeRenderer;
}
export const FormRender = ({ path, children, ...rest }: FormRenderProps) => {
  return (
    <SchemaNodeProxy path={path} {...rest} SchemaNodeRenderer={children} />
  );
};
