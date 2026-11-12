import { memo } from 'react';

import { useReference } from '@winglet/react-utils/hook';

import { FieldProxy } from '@/schema-form/components/FieldProxy';

import { ErrorMessagePartRenderer } from './components/ErrorMessagePartRenderer';
import type { FormErrorMessageProps } from './types/props';

/**
 * Renders validation error messages for form fields.
 *
 * Displays field-specific validation errors with customizable styling.
 * Error visibility is controlled by the form's `errorVisibility` prop and field state
 * (touched, edited, etc.). Automatically handles error formatting and display logic.
 *
 * @example
 * Basic error display:
 * ```tsx
 * <Form.Input path="/email" />
 * <Form.ErrorMessage path="/email" />
 * ```
 *
 * @example
 * Styled error message:
 * ```tsx
 * <Form.ErrorMessage
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
 *     <Form.ErrorMessage path="/username" className="error-message" />
 *   </div>
 * </div>
 * ```
 *
 * @example
 * Conditional error display:
 * ```tsx
 * <Form jsonSchema={schema} errorVisibility={ErrorVisibility.AfterTouch}>
 *   <Form.Input path="/email" />
 *   <Form.ErrorMessage path="/email" />
 * </Form>
 * ```
 */
export const FormErrorMessage = memo(
  ({ path, style, className }: FormErrorMessageProps) => {
    const overridePropsRef = useReference({ style, className });
    return (
      <FieldProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FieldRenderer={ErrorMessagePartRenderer}
      />
    );
  },
);
