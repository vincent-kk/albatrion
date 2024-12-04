import type { CSSProperties, ComponentType } from 'react';

import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';
import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export interface FormLabelProps {
  path: string;
  style?: CSSProperties;
  className?: string;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
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
