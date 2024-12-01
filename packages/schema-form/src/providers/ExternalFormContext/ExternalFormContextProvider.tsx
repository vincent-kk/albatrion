import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@lumy/schema-form/components/FallbackComponents';
import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import { formatError } from '@lumy/schema-form/components/utils/formatError';
import { normalizeFormTypeInputDefinitions } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
  FormTypeRendererProps,
} from '@lumy/schema-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormTypeRendererProps['formatError'];
}

export const ExternalFormContextProvider = ({
  formTypeInputDefinitions,
  FormTypeRenderer: InputFormTypeRenderer,
  FormLabelRenderer: InputFormLabelRenderer,
  FormInputRenderer: InputFormInputRenderer,
  FormErrorRenderer: InputFormErrorRenderer,
  formatError: inputFormatError,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const fromExternalFormTypeInputDefinitions = useMemo(() => {
    return normalizeFormTypeInputDefinitions(formTypeInputDefinitions).map(
      ({ test, Component }) => {
        return {
          test,
          Component: (props: FormTypeInputProps) => (
            <ErrorBoundary>
              <Component {...props} />
            </ErrorBoundary>
          ),
        };
      },
    );
  }, [formTypeInputDefinitions]);

  const FallbackFormTypeRenderer = useMemo(
    () => InputFormTypeRenderer || FormGroupRenderer,
    [InputFormTypeRenderer],
  );

  const FallbackFormLabelRenderer = useMemo(
    () => InputFormLabelRenderer || FormLabelRenderer,
    [InputFormLabelRenderer],
  );

  const FallbackFormInputRenderer = useMemo(
    () => InputFormInputRenderer || FormInputRenderer,
    [InputFormInputRenderer],
  );

  const FallbackFormErrorRenderer = useMemo(
    () => InputFormErrorRenderer || FormErrorRenderer,
    [InputFormErrorRenderer],
  );

  const fallbackFormatError = useMemo(
    () => inputFormatError || formatError,
    [inputFormatError],
  );

  return (
    <ExternalFormContext.Provider
      value={{
        fromExternalFormTypeInputDefinitions,
        FallbackFormTypeRenderer,
        FallbackFormLabelRenderer,
        FallbackFormInputRenderer,
        FallbackFormErrorRenderer,
        fallbackFormatError,
      }}
    >
      {children}
    </ExternalFormContext.Provider>
  );
};
