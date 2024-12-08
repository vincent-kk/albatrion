import { type CSSProperties, type ComponentType } from 'react';

import { useMemorize } from '@lumy-pack/common-react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type { FormTypeRendererProps } from '@/schema-form/types';

export interface FormLabelProps {
  path: string;
  style?: CSSProperties;
  className?: string;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
}

export const FormLabel = ({
  path,
  style,
  className,
  FormTypeRenderer: InputFormTypeRenderer,
}: FormLabelProps) => {
  const { FormLabelRenderer } = useExternalFormContext();
  const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
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
