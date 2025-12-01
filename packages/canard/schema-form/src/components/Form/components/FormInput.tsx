import type { ComponentType } from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type {
  AllowedValue,
  ChildNodeComponentProps,
  FormTypeInputProps,
} from '@/schema-form/types';

export type FormInputProps<Value extends AllowedValue> = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps<Value>>;
} & ChildNodeComponentProps;

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
 *   FormTypeInput={ColorPicker}
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
export const FormInput = <Value extends AllowedValue>({
  path,
  FormTypeInput: InputFormTypeInput,
  ...restProps
}: FormInputProps<Value>) => {
  const { FormInputRenderer } = useExternalFormContext();
  const overridePropsRef = useReference(restProps);
  const FormTypeInput = useConstant(
    InputFormTypeInput as ComponentType<FormTypeInputProps>,
  );
  return (
    <SchemaNodeProxy
      path={path}
      overridePropsRef={overridePropsRef}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormInputRenderer || PluginManager.FormInput}
    />
  );
};
