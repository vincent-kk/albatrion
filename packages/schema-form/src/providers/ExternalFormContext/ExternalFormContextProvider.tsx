import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { normalizeFormTypeInputDefinitions } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@lumy/schema-form/types';

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
  FormGroupRenderer: InputFormGroupRenderer,
  FormLabelRenderer: InputFormLabelRenderer,
  FormInputRenderer: InputFormInputRenderer,
  FormErrorRenderer: InputFormErrorRenderer,
  formatError: inputFormatError,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const fromExternalFormTypeInputDefinitions = useMemo(
    () =>
      formTypeInputDefinitions
        ? normalizeFormTypeInputDefinitions(formTypeInputDefinitions)
        : undefined,
    [formTypeInputDefinitions],
  );

  const FormGroupRenderer = useMemo(
    () => InputFormGroupRenderer,
    [InputFormGroupRenderer],
  );

  const FormLabelRenderer = useMemo(
    () => InputFormLabelRenderer,
    [InputFormLabelRenderer],
  );

  const FormInputRenderer = useMemo(
    () => InputFormInputRenderer,
    [InputFormInputRenderer],
  );

  const FormErrorRenderer = useMemo(
    () => InputFormErrorRenderer,
    [InputFormErrorRenderer],
  );

  const formatError = useMemo(() => inputFormatError, [inputFormatError]);

  return (
    <ExternalFormContext.Provider
      value={{
        fromExternalFormTypeInputDefinitions,
        FormGroupRenderer,
        FormLabelRenderer,
        FormInputRenderer,
        FormErrorRenderer,
        formatError,
      }}
    >
      {children}
    </ExternalFormContext.Provider>
  );
};
