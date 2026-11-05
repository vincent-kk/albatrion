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
 * @remarks
 * `children`, `FieldInput` and `Wrapper` are captured when the component mounts; later values are ignored.
 * The `children` function keeps the closure it had at mount, so component state it closes over stays at its mount value.
 * To supply changing values, read them from the `context` prop the function receives (the `context` of `Form`), call a hook inside the function, or give the element a new `key` to replace the component.
 * The other props are read on every render.
 *
 * @example
 * Basic custom rendering:
 * ```tsx
 * <Form.Render path="/age">
 *   {({ value, node, errorVisible, errorMessage }) => (
 *     <div className="custom-field">
 *       <input
 *         type="range"
 *         min={0}
 *         max={100}
 *         value={Number(value ?? 0)}
 *         onChange={(e) => node.setValue(Number(e.target.value))}
 *       />
 *       <span>{String(value ?? '')}</span>
 *       {errorVisible && <div className="error">{errorMessage}</div>}
 *     </div>
 *   )}
 * </Form.Render>
 * ```
 * `node.setValue` is a programmatic write: it does not mark the field edited, so a display
 * policy that waits for edits never shows this field's errors. Use a `FieldInput`, as in the
 * next example, when it should.
 *
 * @example
 * Complex field with state indicators:
 * ```tsx
 * const PasswordInput = ({ value, onChange }: FieldInputProps<string>) => (
 *   <input
 *     type="password"
 *     value={value ?? ''}
 *     onChange={(e) => onChange(e.target.value)}
 *     className="field__input"
 *   />
 * );
 *
 * <Form.Render path="/password" FieldInput={PasswordInput}>
 *   {({ Input, node, value, errorVisible, errorMessage }) => (
 *     <div
 *       className={cx('field', {
 *         'field--touched': node.isTouched,
 *         'field--edited': node.isEdited,
 *         'field--error': errorVisible,
 *       })}
 *     >
 *       <Input />
 *       <PasswordStrength value={value} />
 *       {errorVisible && <ValidationMessages>{errorMessage}</ValidationMessages>}
 *     </div>
 *   )}
 * </Form.Render>
 * ```
 *
 * @example
 * Conditional rendering based on jsonSchema:
 * ```tsx
 * <Form.Render path="/status">
 *   {({ value, node, jsonSchema }) => {
 *     const options = typeof jsonSchema === 'object' && Array.isArray(jsonSchema.enum) ? jsonSchema.enum : [];
 *
 *     if (options.length <= 3) {
 *       return (
 *         <RadioGroup
 *           value={value}
 *           onChange={(next) => node.setValue(next)}
 *           options={options}
 *         />
 *       );
 *     }
 *
 *     return (
 *       <Select
 *         value={value}
 *         onChange={(next) => node.setValue(next)}
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
