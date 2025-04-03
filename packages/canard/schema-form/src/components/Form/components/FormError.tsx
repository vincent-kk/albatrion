import type { CSSProperties } from 'react';

import { JSONPath } from '@winglet/json-schema';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';

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
        FormTypeRenderer={FormErrorRenderer || PluginManager.FormError}
      />
    </span>
  );
};
