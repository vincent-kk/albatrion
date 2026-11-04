import { type ComponentType, type ReactNode, memo } from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import { FieldProxy } from '@/schema-form/components/FieldProxy';
import type { AllowedValue, FieldInputProps } from '@/schema-form/types';

import type { FormRenderProps } from './types/props';

/**
 * Renders form fields with complete control through a custom render function.
 *
 * Provides access to all field properties including value, errors, schema metadata,
 * and field state, allowing for complex custom UI implementations while maintaining
 * full integration with form validation and state management.
 *
 * @example
 * Basic custom rendering:
 * ```tsx
 * <Form.Render path="/age">
 *   {({ value, onChange, errors, jsonSchema }) => (
 *     <div className="custom-field">
 *       <input
 *         type="range"
 *         min={jsonSchema.minimum || 0}
 *         max={jsonSchema.maximum || 100}
 *         value={value || 0}
 *         onChange={(e) => onChange(Number(e.target.value))}
 *       />
 *       <span>{value}</span>
 *       {errors?.map((err, i) => (
 *         <div key={i} className="error">{err.message}</div>
 *       ))}
 *     </div>
 *   )}
 * </Form.Render>
 * ```
 *
 * @example
 * Complex field with state indicators:
 * ```tsx
 * <Form.Render path="/password">
 *   {({ value, onChange, node, errors }) => {
 *     const { isTouched, isEdited } = node;
 *     return (
 *       <div
 *         className={cx('field', {
 *           'field--touched': isTouched,
 *           'field--edited': isEdited,
 *           'field--error': errors?.length > 0,
 *         })}
 *       >
 *         <input
 *           type="password"
 *           value={value || ''}
 *           onChange={(e) => onChange(e.target.value)}
 *           className="field__input"
 *         />
 *         <PasswordStrength value={value} />
 *         {touched && errors?.length > 0 && (
 *           <ValidationMessages errors={errors} />
 *         )}
 *       </div>
 *     );
 *   }}
 * </Form.Render>;
 *
 * ```
 *
 * @example
 * Conditional rendering based on jsonSchema:
 * ```tsx
 * <Form.Render path="/status">
 *   {({ value, onChange, jsonSchema }) => {
 *     const options = jsonSchema.enum || [];
 *
 *     if (options.length <= 3) {
 *       return (
 *         <RadioGroup
 *           value={value}
 *           onChange={onChange}
 *           options={options}
 *         />
 *       );
 *     }
 *
 *     return (
 *       <Select
 *         value={value}
 *         onChange={onChange}
 *         options={options.map(opt => ({ label: opt, value: opt }))}
 *       />
 *     );
 *   }}
 * </Form.Render>
 * ```
 */
export const FormRender = memo(
  ({
    path,
    FieldInput,
    Wrapper,
    children,
    ...restProps
  }: FormRenderProps<AllowedValue>) => {
    const overridePropsRef = useReference(restProps);
    const constant = useConstant({
      FieldInput: FieldInput as ComponentType<FieldInputProps>,
      FieldRenderer: children,
      Wrapper,
    });
    return (
      <FieldProxy
        path={path}
        overridePropsRef={overridePropsRef}
        FieldInput={constant.FieldInput}
        FieldRenderer={constant.FieldRenderer}
        Wrapper={constant.Wrapper}
      />
    );
  },
) as <Value extends AllowedValue = AllowedValue>(
  props: FormRenderProps<Value>,
) => ReactNode;
