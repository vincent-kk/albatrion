import {
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
  memo,
} from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import type { Dictionary } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import type {
  AllowedValue,
  ChildNodeComponentProps,
  FormTypeInputProps,
  FormTypeRendererProps,
} from '@/schema-form/types';

export type FormGroupProps<Value extends AllowedValue> = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps<Value>>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & ChildNodeComponentProps;

/**
 * Renders a complete form field group with customizable input and renderer components.
 *
 * Combines FormTypeInput and FormTypeRenderer to create a cohesive field experience,
 * typically including label, input, error messages, and any additional UI elements.
 * Allows overriding default components for specialized field types.
 *
 * @example
 * Basic field group with default rendering:
 * ```tsx
 * <Form jsonSchema={schema}>
 *   <Form.Group path="/email" />
 *   <Form.Group path="/password" />
 *   <Form.Group path="/rememberMe" />
 * </Form>
 * ```
 *
 * @example
 * Custom wrapper for layout:
 * ```tsx
 * const FieldWrapper = ({ children, ...props }) => (
 *   <div className="form-field" data-field={props.path}>
 *     {children}
 *   </div>
 * );
 *
 * <Form.Group
 *   path="/username"
 *   Wrapper={FieldWrapper}
 *   placeholder="Enter username"
 *   autoComplete="username"
 * />
 * ```
 *
 * @example
 * Override with custom input component:
 * ```tsx
 * const DatePicker = ({ value, onChange, jsonSchema, ...props }) => (
 *   <ReactDatePicker
 *     selected={value}
 *     onChange={onChange}
 *     minDate={jsonSchema.minimum}
 *     maxDate={jsonSchema.maximum}
 *     {...props}
 *   />
 * );
 *
 * <Form.Group
 *   path="/birthDate"
 *   FormTypeInput={DatePicker}
 *   dateFormat="yyyy-MM-dd"
 *   showYearDropdown
 * />
 * ```
 *
 * @example
 * Custom renderer for complex fields:
 * ```tsx
 * const AddressRenderer = (props) => (
 *   <div className="address-group">
 *     <h4>{props.jsonSchema.title || 'Address'}</h4>
 *     <Form.Input path={`${props.path}/street`} />
 *     <div className="row">
 *       <Form.Input path={`${props.path}/city`} />
 *       <Form.Input path={`${props.path}/zipCode`} />
 *     </div>
 *   </div>
 * );
 *
 * <Form.Group
 *   path="/address"
 *   FormTypeRenderer={AddressRenderer}
 * />
 * ```
 */
export const FormGroup = memo(
  ({
    path,
    FormTypeInput,
    FormTypeRenderer,
    Wrapper,
    ...restProps
  }: FormGroupProps<AllowedValue>) => {
    const overridePropsRef = useReference(restProps);
    const constant = useConstant({
      FormTypeInput: FormTypeInput as ComponentType<FormTypeInputProps>,
      FormTypeRenderer,
      Wrapper,
    });
    return (
      <SchemaNodeProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FormTypeInput={constant.FormTypeInput}
        FormTypeRenderer={constant.FormTypeRenderer}
        Wrapper={constant.Wrapper}
      />
    );
  },
) as <Value extends AllowedValue = AllowedValue>(
  props: FormGroupProps<Value>,
) => ReactNode;
