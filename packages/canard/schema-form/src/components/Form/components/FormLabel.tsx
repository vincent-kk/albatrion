import { type CSSProperties, memo } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';

export interface FormLabelProps {
  path?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Renders an accessible label for form fields.
 *
 * Automatically generates label text from schema title or property name,
 * with proper `for` attribute association to the corresponding input field.
 * Supports custom styling while maintaining accessibility standards.
 *
 * @example
 * Basic label usage:
 * ```tsx
 * <Form.Label path="/email" />
 * <Form.Input path="/email" />
 * ```
 *
 * @example
 * Styled label with required indicator:
 * ```tsx
 * <Form.Label
 *   path="/username"
 *   className="label label--required"
 *   style={{ fontWeight: 'bold' }}
 * />
 * ```
 *
 * @example
 * Custom label layout:
 * ```tsx
 * <div className="form-field">
 *   <div className="label-row">
 *     <Form.Label path="/password" />
 *     <span className="hint">Min 8 characters</span>
 *   </div>
 *   <Form.Input path="/password" type="password" />
 * </div>
 * ```
 *
 * @example
 * Label with icon:
 * ```tsx
 * <div className="label-with-icon">
 *   <Icon name="email" />
 *   <Form.Label path="/email" />
 * </div>
 * ```
 */
export const FormLabel = memo(({ path, style, className }: FormLabelProps) => {
  const { FormLabelRenderer } = useExternalFormContext();
  return (
    <label style={style} className={className} htmlFor={path}>
      <SchemaNodeProxy
        path={path}
        FormTypeRenderer={FormLabelRenderer || PluginManager.FormLabel}
      />
    </label>
  );
});
