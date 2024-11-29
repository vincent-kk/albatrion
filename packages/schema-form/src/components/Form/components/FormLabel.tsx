import type { HTMLAttributes } from 'react';

import { FormLabelRenderer } from '@lumy/schema-form/components/FallbackComponents';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';

export interface FormInputProps
  extends Pick<HTMLAttributes<unknown>, 'className' | 'style'> {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormLabel = ({
  path,
  FormTypeRenderer = FormLabelRenderer,
  style,
  className,
}: FormInputProps) => (
  <label style={style} className={className} htmlFor={path}>
    <SchemaNodeProxy path={path} FormTypeRenderer={FormTypeRenderer} />
  </label>
);
