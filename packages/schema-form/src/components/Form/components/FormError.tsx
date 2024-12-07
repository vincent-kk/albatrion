import type { CSSProperties, ComponentType } from 'react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type { FormTypeRendererProps } from '@/schema-form/types';

export interface FormErrorProps {
  path: string;
  style?: CSSProperties;
  className?: string;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
}

export const FormError = ({
  path,
  style,
  className,
  FormTypeRenderer,
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
