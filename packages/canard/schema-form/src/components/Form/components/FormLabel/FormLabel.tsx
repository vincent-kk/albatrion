import { memo } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import { FieldProxy } from '@/schema-form/components/FieldProxy';
import { useFieldRendererContext } from '@/schema-form/providers';

import type { FormLabelProps } from './types/props';

/**
 * Renders an accessible label for form fields.
 *
 * Automatically generates label text from schema title or property name,
 * associated with its input through `htmlFor={path}`. Its `id="label:${path}"`
 * also lets options groups reference the title through `aria-labelledby`.
 * Both attributes are built from `path` as given, so pass the absolute path.
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
  const { FormLabelRenderer } = useFieldRendererContext();
  return (
    <label
      style={style}
      className={className}
      htmlFor={path}
      id={path !== undefined ? 'label:' + path : undefined}
    >
      <FieldProxy
        path={path}
        FieldRenderer={FormLabelRenderer || PluginManager.FormLabelRenderer}
      />
    </label>
  );
});
