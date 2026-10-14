import { memo } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import { FieldProxy } from '@/schema-form/components/Field';
import { useFieldRendererContext } from '@/schema-form/providers';

import type { FormErrorProps } from './type';

/**
 * Renders validation error messages for form fields.
 *
 * Displays field-specific validation errors with customizable styling.
 * Error visibility is controlled by the form's `showError` prop and field state
 * (touched, dirty, etc.). Automatically handles error formatting and display logic.
 *
 * @example
 * Basic error display:
 * ```tsx
 * <Form.Input path="/email" />
 * <Form.Error path="/email" />
 * ```
 *
 * @example
 * Styled error message:
 * ```tsx
 * <Form.Error
 *   path="/password"
 *   className="error-text error-text--critical"
 *   style={{ marginTop: '4px', fontSize: '14px' }}
 * />
 * ```
 *
 * @example
 * Custom error layout:
 * ```tsx
 * <div className="form-field">
 *   <Form.Input path="/username" />
 *   <div className="error-container">
 *     <Icon name="alert" />
 *     <Form.Error path="/username" className="error-message" />
 *   </div>
 * </div>
 * ```
 *
 * @example
 * Conditional error display:
 * ```tsx
 * <Form jsonSchema={schema} showError={ShowError.Touched}>
 *   {({ node }) => (
 *     <>
 *       <Form.Input path="/email" />
 *       {node?.find('/email')?.state.touched && (
 *         <Form.Error path="/email" />
 *       )}
 *     </>
 *   )}
 * </Form>
 * ```
 */
export const FormError = memo(({ path, style, className }: FormErrorProps) => {
  const { FormErrorRenderer } = useFieldRendererContext();
  return (
    <span style={style} className={className}>
      <FieldProxy
        path={path}
        FieldRenderer={FormErrorRenderer || PluginManager.FormErrorRenderer}
      />
    </span>
  );
});
