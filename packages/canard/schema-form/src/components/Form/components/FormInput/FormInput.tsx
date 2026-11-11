import { type ComponentType, type ReactNode, memo } from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import { PluginManager } from '@/schema-form/app/plugin';
import { FieldProxy } from '@/schema-form/components/FieldProxy';
import { useFieldRendererContext } from '@/schema-form/providers';
import type { AllowedValue, FieldInputProps } from '@/schema-form/types';

import type { FormInputProps } from './types/props';

/**
 * Renders form input fields with automatic type detection from schema.
 *
 * Automatically selects the appropriate input component based on schema type
 * (text, number, boolean, select, etc.) with full validation and state management.
 * Supports overriding with custom input components and passing additional props.
 *
 * @remarks
 * `FieldInput` is captured when the component mounts; a later value is ignored.
 * To supply changing values, read them from the `context` prop the input receives (the `context` of `Form`), call a hook inside it, or give the element a new `key` to replace the component.
 *
 * `onChange` and `onFileAttach` are binding-owned and cannot be passed to this layout component.
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
 *   className="input-email"
 *   inputProps={{ autoComplete: 'email' }}
 * />
 * ```
 *
 * The built-in string input passes `inputProps` to its `<input>`; other extra props reach the field input component unchanged, so a custom `FieldInput` can read them.
 *
 * @example
 * Custom input component:
 * ```tsx
 * const ColorPicker = ({ value, onChange, disabled }: FieldInputProps<string>) => (
 *   <input
 *     type="color"
 *     value={value ?? '#000000'}
 *     onChange={(e) => onChange(e.target.value)}
 *     disabled={disabled}
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
 * Input with blur handler and validation feedback:
 * ```tsx
 * <div className="field">
 *   <Form.Input
 *     path="/username"
 *     inputProps={{
 *       onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
 *         console.log('Field blurred:', e.target.value),
 *     }}
 *   />
 *   <Form.ErrorMessage path="/username" />
 * </div>
 * ```
 */
export const FormInput = memo(
  ({
    path,
    FieldInput: InputFieldInput,
    ...restProps
  }: FormInputProps<AllowedValue>) => {
    const { InputRenderer } = useFieldRendererContext();
    const overridePropsRef = useReference(restProps);
    const FieldInput = useConstant(
      InputFieldInput as ComponentType<FieldInputProps>,
    );
    return (
      <FieldProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FieldInput={FieldInput}
        FieldRenderer={InputRenderer || PluginManager.InputRenderer}
      />
    );
  },
) as <Value extends AllowedValue = AllowedValue>(
  props: FormInputProps<Value>,
) => ReactNode;
