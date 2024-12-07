import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { normalizeFormTypeInputDefinitions } from '@lumy-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@lumy-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
}

export const ExternalFormContextProvider = ({
  formTypeInputDefinitions,
  FormGroupRenderer,
  FormLabelRenderer,
  FormInputRenderer,
  FormErrorRenderer,
  formatError,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const value = useMemo(
    () => ({
      fromExternalFormTypeInputDefinitions: formTypeInputDefinitions
        ? normalizeFormTypeInputDefinitions(formTypeInputDefinitions)
        : undefined,
      FormGroupRenderer,
      FormLabelRenderer,
      FormInputRenderer,
      FormErrorRenderer,
      formatError,
    }),
    [
      formTypeInputDefinitions,
      FormGroupRenderer,
      FormLabelRenderer,
      FormInputRenderer,
      FormErrorRenderer,
      formatError,
    ],
  );
  return (
    <ExternalFormContext.Provider value={value}>
      {children}
    </ExternalFormContext.Provider>
  );
};
