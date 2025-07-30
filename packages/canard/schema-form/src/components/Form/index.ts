import { Form as BaseFrom } from './Form';
import {
  FormError,
  FormGroup,
  FormInput,
  FormLabel,
  FormRender,
} from './components';

export type { FormChildrenProps, FormProps, FormHandle } from './type';
export type {
  FormErrorProps,
  FormGroupProps,
  FormInputProps,
  FormLabelProps,
  FormRenderProps,
} from './components';

export type { FormRender, FormGroup, FormLabel, FormInput, FormError };

/**
 * Schema-driven form system with JSON Schema validation and dynamic UI composition.
 *
 * Provides a complete form solution including automatic field generation, validation,
 * error handling, and flexible UI customization. Built on JSON Schema standards for
 * universal compatibility and type safety.
 *
 * ### Usage Patterns
 *
 * **Basic Schema-Driven Form:**
 * ```typescript
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', minLength: 2 },
 *     age: { type: 'number', minimum: 0 }
 *   }
 * };
 *
 * <Form
 *   jsonSchema={schema}
 *   onChange={setValue}
 *   onSubmit={handleSubmit}
 * />
 * ```
 *
 * **Custom Layout with Composition:**
 * ```typescript
 * <Form jsonSchema={schema}>
 *   <div className="form-row">
 *     <Form.Label path="/name" />
 *     <Form.Input path="/name" />
 *     <Form.Error path="/name" />
 *   </div>
 * </Form>
 * ```
 *
 * **Dynamic UI with Function Children:**
 * ```typescript
 * <Form jsonSchema={schema}>
 *   {({ value, errors }) => (
 *     <>
 *       <Form.Input path="/email" />
 *       {value?.email && <Form.Input path="/password" />}
 *       {errors?.length > 0 && <ErrorSummary errors={errors} />}
 *     </>
 *   )}
 * </Form>
 * ```
 *
 * ### Component References
 *
 * For detailed documentation with comprehensive examples and API details:
 * - **Form main component**: See {@link BaseFrom} export
 * - **Form.Render**: See {@link FormRender} export - Custom rendering with full control
 * - **Form.Group**: See {@link FormGroup} export - Grouped field with label and input
 * - **Form.Label**: See {@link FormLabel} export - Field label rendering
 * - **Form.Input**: See {@link FormInput} export - Field input rendering
 * - **Form.Error**: See {@link FormError} export - Field error rendering
 *
 * ### Design Philosophy
 *
 * This schema-driven approach provides multiple benefits:
 * - **Type Safety**: Full TypeScript support with schema type inference
 * - **Validation**: Built-in JSON Schema validation with customizable rules
 * - **Flexibility**: From automatic generation to complete custom layouts
 * - **Composition**: Mix and match components for any UI requirement
 * - **Performance**: Optimized re-rendering with fine-grained updates
 */
export const Form = Object.assign(BaseFrom, {
  /**
   * Renders form fields with custom rendering function.
   *
   * Provides complete control over field rendering while maintaining
   * schema validation and state management.
   *
   * **For comprehensive documentation and examples, see:** {@link FormRender}
   *
   * @param props - FormRender properties including path and render function
   * @returns Custom rendered form field
   */
  Render: FormRender,

  /**
   * Renders a complete form field group with label, input, and error.
   *
   * Combines FormTypeInput and FormTypeRenderer for a complete field experience
   * with customizable wrapper and override properties.
   *
   * **For comprehensive documentation and examples, see:** {@link FormGroup}
   *
   * @param props - FormGroup properties including path and customization options
   * @returns Complete form field group
   */
  Group: FormGroup,

  /**
   * Renders a form field label.
   *
   * Automatically generates accessible labels from schema with proper
   * for/id associations and customizable styling.
   *
   * **For comprehensive documentation and examples, see:** {@link FormLabel}
   *
   * @param props - FormLabel properties including path and styling
   * @returns Label element for form field
   */
  Label: FormLabel,

  /**
   * Renders a form field input.
   *
   * Automatically selects appropriate input type based on schema
   * with full validation and state management integration.
   *
   * **For comprehensive documentation and examples, see:** {@link FormInput}
   *
   * @param props - FormInput properties including path and overrides
   * @returns Input element for form field
   */
  Input: FormInput,

  /**
   * Renders form field validation errors.
   *
   * Displays validation messages with customizable formatting
   * and conditional visibility based on field state.
   *
   * **For comprehensive documentation and examples, see:** {@link FormError}
   *
   * @param props - FormError properties including path and styling
   * @returns Error message element
   */
  Error: FormError,
});
