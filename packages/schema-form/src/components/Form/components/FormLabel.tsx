import { type HTMLAttributes, useContext } from 'react';

import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import { ExternalFormContext } from '@lumy/schema-form/providers';

export interface FormLabelProps
  extends Pick<HTMLAttributes<unknown>, 'className' | 'style'> {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormLabel = ({
  path,
  FormTypeRenderer,
  style,
  className,
}: FormLabelProps) => {
  const { FallbackFormLabelRenderer } = useContext(ExternalFormContext);
  return (
    <label style={style} className={className} htmlFor={path}>
      <SchemaNodeProxy
        path={path}
        FormTypeRenderer={FormTypeRenderer || FallbackFormLabelRenderer}
      />
    </label>
  );
};
