import type { CSSProperties, ComponentType } from 'react';

import { FallbackManager } from '@lumy-form/app/FallbackManager';
import { SchemaNodeProxy } from '@lumy-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy-form/providers';
import type { FormTypeRendererProps } from '@lumy-form/types';

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
