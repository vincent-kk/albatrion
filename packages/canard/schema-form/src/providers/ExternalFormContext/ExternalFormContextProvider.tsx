import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import type { Ajv } from '@/schema-form/helpers/ajv';
import { normalizeFormTypeInputDefinitions } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ShowError,
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
  /** Global user-defined context, merged with user-defined context */
  context?: Dictionary;
  /** Ajv instance declared externally, creates internally if not provided */
  ajv?: Ajv;
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
  context: contextInput,
  ajv,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const memoized = useMemorize({
    formTypeInputDefinitions,
    FormGroupRenderer,
    FormLabelRenderer,
    FormInputRenderer,
    FormErrorRenderer,
    formatError,
  });
  const context = useSnapshot(contextInput);
  const value = useMemo(
    () => ({
      fromExternalFormTypeInputDefinitions: memoized.formTypeInputDefinitions
        ? normalizeFormTypeInputDefinitions(memoized.formTypeInputDefinitions)
        : undefined,
      FormGroupRenderer: memoized.FormGroupRenderer,
      FormLabelRenderer: memoized.FormLabelRenderer,
      FormInputRenderer: memoized.FormInputRenderer,
      FormErrorRenderer: memoized.FormErrorRenderer,
      formatError: memoized.formatError,
      showError,
      validationMode,
      context,
      ajv,
    }),
    [memoized, showError, validationMode, context, ajv],
  );
  return (
    <ExternalFormContext.Provider value={value}>
      {children}
    </ExternalFormContext.Provider>
  );
};
