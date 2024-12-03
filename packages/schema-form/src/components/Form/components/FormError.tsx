import { type HTMLAttributes } from 'react';

import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';

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
  const { FormErrorRenderer } = useExternalFormContext();
  return (
    <div style={style} className={className}>
      <SchemaNodeProxy
        path={path}
        FormTypeRenderer={
          FormTypeRenderer || FormErrorRenderer || FallbackManager.FormError
        }
      />
    </div>
  );
};
