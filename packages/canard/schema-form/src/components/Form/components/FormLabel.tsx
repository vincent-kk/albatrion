import { type CSSProperties, memo } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import { FieldProxy } from '@/schema-form/components/Field';
import { FieldNodeEventType } from '@/schema-form/core';
import { isFieldInputGroup } from '@/schema-form/helpers/fieldInputGroup';
import { useFieldNode } from '@/schema-form/hooks/useFieldNode';
import { useFieldNodeTracker } from '@/schema-form/hooks/useFieldNodeTracker';
import { useFieldRendererContext } from '@/schema-form/providers';

export interface FormLabelProps {
  path?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Renders an accessible label for form fields.
 *
 * Automatically generates label text from schema title or property name,
 * associated with its input through `htmlFor={path}`. For a builtin checkbox
 * or radio group it carries `id="${path}-label"` instead, which the options
 * group references with `aria-labelledby`.
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
  const node = useFieldNode(path);
  useFieldNodeTracker(
    node,
    FieldNodeEventType.UpdateJsonSchema | FieldNodeEventType.UpdatePath,
  );
  const isGroup = node && isFieldInputGroup(node.jsonSchema);
  return (
    <label
      style={style}
      className={className}
      htmlFor={isGroup ? undefined : path}
      id={isGroup ? `${node.path}-label` : undefined}
    >
      <FieldProxy
        path={path}
        FieldRenderer={FormLabelRenderer || PluginManager.FormLabelRenderer}
      />
    </label>
  );
});
