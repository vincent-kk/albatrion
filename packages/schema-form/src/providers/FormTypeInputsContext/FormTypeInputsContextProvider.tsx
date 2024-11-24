import { type PropsWithChildren, useMemo } from 'react';

import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import {
  normalizeFormTypeInputDefinitions,
  normalizeFormTypeInputMap,
} from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

import { FormTypeInputsContext } from './FormTypeInputsContext';

export interface FormTypeInputsContextProviderProps {
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  formTypeInputMap?: FormTypeInputMap;
}

export const FormTypeInputsContextProvider = ({
  formTypeInputDefinitions,
  formTypeInputMap,
  children,
}: PropsWithChildren<FormTypeInputsContextProviderProps>) => {
  const fromFormTypeInputDefinitions = useMemo(() => {
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

  const fromFormTypeInputMap = useMemo(() => {
    return normalizeFormTypeInputMap(formTypeInputMap).map(
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
  }, [formTypeInputMap]);

  return (
    <FormTypeInputsContext.Provider
      value={{
        fromFormTypeInputDefinitions,
        fromFormTypeInputMap,
      }}
    >
      {children}
    </FormTypeInputsContext.Provider>
  );
};
