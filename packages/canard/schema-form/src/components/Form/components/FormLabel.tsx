import type { CSSProperties } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';

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
        path={path}
        FormTypeRenderer={FormLabelRenderer || PluginManager.FormLabel}
      />
    </label>
  );
};
