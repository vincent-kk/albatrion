import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary, Fn } from '@aileron/declare';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import type {
  AllowedValue,
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormRenderProps<Value extends AllowedValue> = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps<Value>>;
  children: Fn<[props: FormTypeRendererProps], ReactNode>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & OverridableFormTypeInputProps;

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
 *     const { touched, dirty } = node.state;
 *     return (
 *       <div
 *         className={cx('field', {
 *           'field--touched': touched,
 *           'field--dirty': dirty,
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
export const FormRender = <Value extends AllowedValue = AllowedValue>({
  path,
  FormTypeInput,
  Wrapper,
  children,
  ...restProps
}: FormRenderProps<Value>) => {
  const overrideProps = useSnapshot(restProps);
  const constant = useConstant({
    FormTypeInput: FormTypeInput as ComponentType<FormTypeInputProps>,
    FormTypeRenderer: children,
    Wrapper,
  });
  return (
    <SchemaNodeProxy
      path={path}
      overrideProps={overrideProps}
      FormTypeInput={constant.FormTypeInput}
      FormTypeRenderer={constant.FormTypeRenderer}
      Wrapper={constant.Wrapper}
    />
  );
};
