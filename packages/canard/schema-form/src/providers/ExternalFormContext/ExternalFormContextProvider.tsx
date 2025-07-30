import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import { normalizeFormTypeInputDefinitions } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ShowError,
  ValidatorFactory,
} from '@/schema-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  /** List of FormTypeInputDefinition declared externally */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormGroupRenderer component declared externally */
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormLabelRenderer component declared externally */
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormInputRenderer component declared externally */
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormErrorRenderer component declared externally */
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /**
   * Error display condition
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Dirty`: Show errors when value has changed
   *   - `ShowError.Touched`: Show errors when input has been focused
   *   - `ShowError.DirtyTouched`: Show errors when both Dirty and Touched states are met
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode
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
 * Custom form type definitions:
 * ```tsx
 * const customFormTypes = [
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
 *   formTypeInputDefinitions={customFormTypes}
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
 * import Ajv from 'ajv';
 * import addFormats from 'ajv-formats';
 *
 * const ajv = new Ajv({ allErrors: true });
 * addFormats(ajv);
 *
 * const validatorFactory = (jsonSchema) => {
 *   const validate = ajv.compile(jsonSchema);
 *   return (value) => {
 *     validate(value);
 *     return validate.errors?.map(err => ({
 *       dataPath: err.instancePath,
 *       keyword: err.keyword,
 *       message: err.message,
 *       details: err.params,
 *       source: err,
 *     })) || [];
 *   };
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
 *   FormGroupRenderer={MyFormGroup}
 *   FormLabelRenderer={MyFormLabel}
 *   FormInputRenderer={MyFormInput}
 *   FormErrorRenderer={MyFormError}
 *
 *   // Custom input types
 *   formTypeInputDefinitions={[
 *     { test: { format: 'date' }, Component: DatePicker },
 *     { test: { format: 'time' }, Component: TimePicker },
 *   ]}
 *
 *   // Error handling
 *   formatError={customFormatError}
 *   showError={ShowError.DirtyTouched}
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
  formTypeInputDefinitions,
  FormGroupRenderer,
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
    formTypeInputDefinitions,
    FormGroupRenderer,
    FormLabelRenderer,
    FormInputRenderer,
    FormErrorRenderer,
    formatError,
  });
  const context = useSnapshot(inputContext);
  const value = useMemo(
    () => ({
      fromExternalFormTypeInputDefinitions: constant.formTypeInputDefinitions
        ? normalizeFormTypeInputDefinitions(constant.formTypeInputDefinitions)
        : undefined,
      FormGroupRenderer: constant.FormGroupRenderer,
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
