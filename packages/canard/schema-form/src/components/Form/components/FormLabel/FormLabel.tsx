import { memo } from 'react';

import { useReference } from '@winglet/react-utils/hook';

import { FieldProxy } from '@/schema-form/components/FieldProxy';

import { LabelPartRenderer } from './components/LabelPartRenderer';
import type { FormLabelProps } from './types/props';

/**
 * Renders an accessible label for form fields.
 *
 * Uses children when supplied, otherwise the field name (key or index),
 * associated with its input through the Form-scoped id of the resolved field. Its title id
 * also lets options groups reference the title through `aria-labelledby`.
 * A query resolving to one node uses that node's scoped id for both attributes.
 * Multiple matches retain the supplied path; no match renders nothing.
 * The registered LabelRenderer owns the label root; no outer label is added.
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
export const FormLabel = memo(
  ({ path, style, className, children }: FormLabelProps) => {
    const overridePropsRef = useReference({
      style,
      className,
      children,
      htmlFor: path,
    });
    return (
      <FieldProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FieldRenderer={LabelPartRenderer}
      />
    );
  },
);
