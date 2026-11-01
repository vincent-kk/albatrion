import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import { normalizeFieldInputDefinitions } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  FieldInputDefinition,
  FieldRendererProps,
  FormatError,
  ShowError,
  ValidatorFactory,
} from '@/schema-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  /** List of FieldInputDefinition declared externally */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** FormLabelRenderer component declared externally */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** FormInputRenderer component declared externally */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** FormErrorRenderer component declared externally */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /**
   * Error display condition (default: ShowError.EditedTouched)
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Edited`: Show errors when value has changed
   *   - `ShowError.Touched`: Show errors after the input has lost focus once
   *   - `ShowError.EditedTouched`: Show errors when both Edited and Touched states are met
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** ValidatorFactory declared externally, creates internally if not provided */
  validatorFactory?: ValidatorFactory;
  /** Global user-defined context, merged with user-defined context */
  context?: Dictionary;
}

/**
 * Provides external form configuration through React context.
 *
 * Wraps child components with form-level configuration that applies to all nested forms.
 * This allows centralized configuration of form behavior, custom components, and validation
 * without prop drilling. Useful for applying consistent styling and behavior across
 * multiple forms in an application.
 *
 * @example
 * Basic usage with custom renderers:
 * ```tsx
 * function App() {
 *   return (
 *     <FormProvider
 *       FormLabelRenderer={CustomLabel}
 *       FormErrorRenderer={CustomError}
 *       showError={ShowError.Touched}
 *     >
 *       <MyForms />
 *     </FormProvider>
 *   );
 * }
 * ```
 *
 * @example
 * Custom field input definitions:
 * ```tsx
 * const customInputTypes = [
 *   {
 *     test: { type: 'string', format: 'phone' },
 *     Component: PhoneInput,
 *   },
 *   {
 *     test: { type: 'string', format: 'ssn' },
 *     Component: SSNInput,
 *   },
 * ];
 *
 * <FormProvider
 *   fieldInputDefinitions={customInputTypes}
 * >
 *   <Form jsonSchema={schema} />
 * </FormProvider>
 * ```
 *
 * @example
 * Global error formatting:
 * ```tsx
 * const formatError = (error, node, context) => {
 *   const fieldName = node.jsonSchema.title || node.name;
 *
 *   switch (error.keyword) {
 *     case 'required':
 *       return `${fieldName} is required`;
 *     case 'minLength':
 *       return `${fieldName} must be at least ${error.details?.limit} characters`;
 *     case 'pattern':
 *       return `${fieldName} has invalid format`;
 *     default:
 *       return error.message || 'Invalid value';
 *   }
 * };
 *
 * <FormProvider
 *   formatError={formatError}
 *   showError={true}
 * >
 *   <MyForms />
 * </FormProvider>
 * ```
 *
 * @example
 * Custom validation with external validator:
 * ```tsx
 * // A validator object declares both `compile` and `compileGuard`.
 * // Declare it once outside components: changing the reference rebuilds the tree.
 * const validatorFactory: ValidatorFactory = {
 *   compile: (copy) => compileWithMyEngine(copy),
 *   compileGuard: (root, pointer) => compileGuardWithMyEngine(root, pointer),
 * };
 *
 * <FormProvider
 *   validatorFactory={validatorFactory}
 *   validationMode={ValidationMode.OnChange}
 * >
 *   <Form jsonSchema={schema} />
 * </FormProvider>
 * ```
 *
 * @example
 * Complete configuration example:
 * ```tsx
 * <FormProvider
 *   // Custom renderers
 *   FieldRenderer={MyFormField}
 *   FormLabelRenderer={MyFormLabel}
 *   FormInputRenderer={MyFormInput}
 *   FormErrorRenderer={MyFormError}
 *
 *   // Custom input types
 *   fieldInputDefinitions={[
 *     { test: { format: 'date' }, Component: DatePicker },
 *     { test: { format: 'time' }, Component: TimePicker },
 *   ]}
 *
 *   // Error handling
 *   formatError={customFormatError}
 *   showError={ShowError.EditedTouched}
 *
 *   // Validation
 *   validationMode={ValidationMode.OnChange}
 *   validatorFactory={customValidator}
 *
 *   // Global context
 *   context={{
 *     theme: 'dark',
 *     locale: 'en-US',
 *     apiEndpoint: '/api/v1',
 *   }}
 * >
 *   <ApplicationForms />
 * </FormProvider>
 * ```
 *
 * @remarks
 * - Configuration from this provider is merged with form-level props
 * - Form-level props take precedence over provider configuration
 * - Use `registerPlugin` for truly global configuration across the entire app
 * - This provider is ideal for section-specific or feature-specific configuration
 */
export const ExternalFormContextProvider = ({
  fieldInputDefinitions,
  FieldRenderer,
  FormLabelRenderer,
  FormInputRenderer,
  FormErrorRenderer,
  formatError,
  showError,
  validationMode,
  context: inputContext,
  validatorFactory,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const constant = useConstant({
    fieldInputDefinitions,
    FieldRenderer,
    FormLabelRenderer,
    FormInputRenderer,
    FormErrorRenderer,
    formatError,
  });
  const context = useSnapshot(inputContext);
  const value = useMemo(
    () => ({
      fromExternalFieldInputDefinitions: constant.fieldInputDefinitions
        ? normalizeFieldInputDefinitions(constant.fieldInputDefinitions)
        : undefined,
      FieldRenderer: constant.FieldRenderer,
      FormLabelRenderer: constant.FormLabelRenderer,
      FormInputRenderer: constant.FormInputRenderer,
      FormErrorRenderer: constant.FormErrorRenderer,
      formatError: constant.formatError,
      showError,
      validationMode,
      validatorFactory,
      context,
    }),
    [constant, showError, validationMode, validatorFactory, context],
  );
  return (
    <ExternalFormContext.Provider value={value}>
      {children}
    </ExternalFormContext.Provider>
  );
};
