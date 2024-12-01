import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { FormGroupRenderer } from '@lumy/schema-form/components/FallbackComponents';
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
  formatError?: FormTypeRendererProps['formatError'];
}

export const ExternalFormContextProvider = ({
  formTypeInputDefinitions,
  FormTypeRenderer,
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
    () => FormTypeRenderer || FormGroupRenderer,
    [FormTypeRenderer],
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
        fallbackFormatError,
      }}
    >
      {children}
    </ExternalFormContext.Provider>
  );
};
