import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { FormGroupRenderer } from '@lumy/schema-form/components/FallbackComponents';
import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
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
}

export const ExternalFormContextProvider = ({
  formTypeInputDefinitions,
  FormTypeRenderer,
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

  return (
    <ExternalFormContext.Provider
      value={{
        fromExternalFormTypeInputDefinitions,
        FallbackFormTypeRenderer,
      }}
    >
      {children}
    </ExternalFormContext.Provider>
  );
};
