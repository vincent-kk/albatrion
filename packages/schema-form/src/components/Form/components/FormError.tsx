import { type HTMLAttributes, useContext } from 'react';

import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import { ExternalFormContext } from '@lumy/schema-form/providers';

export interface FormErrorProps
  extends Pick<HTMLAttributes<unknown>, 'className' | 'style'> {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormError = ({
  path,
  FormTypeRenderer,
  style,
  className,
}: FormErrorProps) => {
  const { FallbackFormErrorRenderer } = useContext(ExternalFormContext);
  return (
    <div style={style} className={className}>
      <SchemaNodeProxy
        path={path}
        FormTypeRenderer={FormTypeRenderer || FallbackFormErrorRenderer}
      />
    </div>
  );
};
