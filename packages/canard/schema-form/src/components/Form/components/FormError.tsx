import type { CSSProperties } from 'react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import { JSONPath } from '@/schema-form/types';

export interface FormErrorProps {
  path?: string;
  style?: CSSProperties;
  className?: string;
}

export const FormError = ({ path, style, className }: FormErrorProps) => {
  const { FormErrorRenderer } = useExternalFormContext();
  return (
    <span style={style} className={className}>
      <SchemaNodeProxy
        path={path ?? JSONPath.Root}
        FormTypeRenderer={FormErrorRenderer || FallbackManager.FormError}
      />
    </span>
  );
};
