import { type HTMLAttributes } from 'react';

import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';

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
  const { FormLabelRenderer } = useExternalFormContext();
  return (
    <label style={style} className={className} htmlFor={path}>
      <SchemaNodeProxy
        path={path}
        FormTypeRenderer={
          FormTypeRenderer || FormLabelRenderer || FallbackManager.FormLabel
        }
      />
    </label>
  );
};
