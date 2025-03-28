import type { CSSProperties } from 'react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import { JSONPath } from '@/schema-form/types';

export interface FormLabelProps {
  path?: string;
  style?: CSSProperties;
  className?: string;
}

export const FormLabel = ({ path, style, className }: FormLabelProps) => {
  const { FormLabelRenderer } = useExternalFormContext();
  return (
    <label style={style} className={className} htmlFor={path}>
      <SchemaNodeProxy
        path={path ?? JSONPath.Root}
        FormTypeRenderer={FormLabelRenderer || FallbackManager.FormLabel}
      />
    </label>
  );
};
