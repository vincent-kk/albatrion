import type { HTMLAttributes } from 'react';

import { FromErrorRenderer } from '@lumy/schema-form/components/FallbackComponents/FromErrorRenderer';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';

interface FormInputProps
  extends Pick<HTMLAttributes<unknown>, 'className' | 'style'> {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormError = ({
  path,
  FormTypeRenderer = FromErrorRenderer,
  style,
  className,
}: FormInputProps) => (
  <span style={style} className={className}>
    <SchemaNodeProxy path={path} FormTypeRenderer={FormTypeRenderer} />
  </span>
);
