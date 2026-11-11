import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { useSnapshot } from '@winglet/react-utils/hook';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import { normalizeFieldInputDefinitions } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ErrorVisibility,
  FieldInputDefinition,
  FieldRendererProps,
  LabelRendererProps,
  ErrorMessageRendererProps,
  FormatError,
  ValidatorFactory,
} from '@/schema-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  /** List of FieldInputDefinition declared externally */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** LabelRenderer component declared externally */
  LabelRenderer?: ComponentType<LabelRendererProps>;
  /** InputRenderer component declared externally */
  InputRenderer?: ComponentType<FieldRendererProps>;
  /** ErrorMessageRenderer component declared externally */
  ErrorMessageRenderer?: ComponentType<ErrorMessageRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /**
   * Live display policy; defaults to AfterEditAndTouch after FormProvider fallback.
   * Always/Never, AfterEdit/AfterTouch, AfterEditAndTouch/AfterEditOrTouch are string enum values.
   * Node ErrorVisibility overrides precede the policy, without bypassing presence or OnChange release.
   */
  errorVisibility?: ErrorVisibility;
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
 *       LabelRenderer={CustomLabel}
 *       ErrorMessageRenderer={CustomError}
 *       errorVisibility={ErrorVisibility.AfterTouch}
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
 *   errorVisibility={ErrorVisibility.Always}
 * >
 *   <MyForms />
 * </FormProvider>
 * ```
 *
 * @example
 * Custom validation with external validator:
 * ```tsx
 * // A validator object declares both `compile` and `compileGuard`.
 * // Module scope: create this object once, outside components.
 * // A new selected reference re-initializes the form; see the validator lifetime contract:
 * // https://vincent-kk.github.io/albatrion/docs/canard/schema-form/api-reference#configuration-lifetime
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
 *   LabelRenderer={MyFormLabel}
 *   InputRenderer={MyFormInput}
 *   ErrorMessageRenderer={MyFormError}
 *
 *   // Custom input types
 *   fieldInputDefinitions={[
 *     { test: { format: 'date' }, Component: DatePicker },
 *     { test: { format: 'time' }, Component: TimePicker },
 *   ]}
 *
 *   // Error handling
 *   formatError={customFormatError}
 *   errorVisibility={ErrorVisibility.AfterEditAndTouch}
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
  LabelRenderer,
  InputRenderer,
  ErrorMessageRenderer,
  formatError,
  errorVisibility,
  validationMode,
  context: inputContext,
  validatorFactory,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const fromExternalFieldInputDefinitions = useMemo(
    () =>
      fieldInputDefinitions
        ? normalizeFieldInputDefinitions(fieldInputDefinitions)
        : undefined,
    [fieldInputDefinitions],
  );
  const context = useSnapshot(inputContext);
  const value = useMemo(
    () => ({
      fromExternalFieldInputDefinitions,
      FieldRenderer,
      LabelRenderer,
      InputRenderer,
      ErrorMessageRenderer,
      formatError,
      errorVisibility,
      validationMode,
      validatorFactory,
      context,
    }),
    [
      fromExternalFieldInputDefinitions,
      FieldRenderer,
      LabelRenderer,
      InputRenderer,
      ErrorMessageRenderer,
      formatError,
      errorVisibility,
      validationMode,
      validatorFactory,
      context,
    ],
  );
  return (
    <ExternalFormContext.Provider value={value}>
      {children}
    </ExternalFormContext.Provider>
  );
};
