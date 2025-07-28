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
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Dirty`: Show errors when value has changed
   *   - `ShowError.Touched`: Show errors when input has been focused
   *   - `ShowError.DirtyTouched`: Show errors when both Dirty and Touched states are met
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
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
