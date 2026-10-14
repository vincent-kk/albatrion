import { type ComponentType, type ReactNode, memo } from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import { PluginManager } from '@/schema-form/app/plugin';
import { FieldProxy } from '@/schema-form/components/FieldProxy';
import { useFieldRendererContext } from '@/schema-form/providers';
import type { AllowedValue, FieldInputProps } from '@/schema-form/types';

import type { BaseFormInputProps } from './type';

/**
 * Renders form input fields with automatic type detection from schema.
 *
 * Automatically selects the appropriate input component based on schema type
 * (text, number, boolean, select, etc.) with full validation and state management.
 * Supports overriding with custom input components and passing additional props.
 *
 * @example
 * Basic input usage:
 * ```tsx
 * <Form jsonSchema={schema}>
 *   <Form.Input path="/name" />
 *   <Form.Input path="/age" />
 *   <Form.Input path="/isActive" />
 * </Form>
 * ```
 *
 * @example
 * Input with additional props:
 * ```tsx
 * <Form.Input
 *   path="/email"
 *   placeholder="user@example.com"
 *   autoComplete="email"
 *   required
 *   className="input-email"
 * />
 * ```
 *
 * @example
 * Custom input component:
 * ```tsx
 * const ColorPicker = ({ value, onChange, ...props }) => (
 *   <input
 *     type="color"
 *     value={value || '#000000'}
 *     onChange={(e) => onChange(e.target.value)}
 *     {...props}
 *   />
 * );
 *
 * <Form.Input
 *   path="/theme/primaryColor"
 *   FieldInput={ColorPicker}
 * />
 * ```
 *
 * @example
 * Controlled input with validation feedback:
 * ```tsx
 * <div className="field">
 *   <Form.Input
 *     path="/username"
 *     // This Input should support onBlur handler
 *     onBlur={(e) => console.log('Field blurred:', e.target.value)}
 *     onChange={(value) => console.log('Value changed:', value)}
 *   />
 *   <Form.Error path="/username" />
 * </div>
 * ```
 */
export const FormInput = memo(
  ({
    path,
    FieldInput: InputFieldInput,
    ...restProps
  }: BaseFormInputProps<AllowedValue>) => {
    const { FormInputRenderer } = useFieldRendererContext();
    const overridePropsRef = useReference(restProps);
    const FieldInput = useConstant(
      InputFieldInput as ComponentType<FieldInputProps>,
    );
    return (
      <FieldProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FieldInput={FieldInput}
        FieldRenderer={FormInputRenderer || PluginManager.FormInputRenderer}
      />
    );
  },
) as <Value extends AllowedValue = AllowedValue>(
  props: BaseFormInputProps<Value>,
) => ReactNode;
