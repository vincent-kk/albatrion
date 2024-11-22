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
  const mergedFormTypeInputDefinitions = useMemo(() => {
    const normalizedFormTypeInputMap =
      normalizeFormTypeInputMap(formTypeInputMap);
    const normalizedFormTypeInputDefinitions =
      normalizeFormTypeInputDefinitions(formTypeInputDefinitions);
    return [
      ...normalizedFormTypeInputMap,
      ...normalizedFormTypeInputDefinitions,
    ].map(({ test, Component }) => {
      return {
        test,
        Component: (props: FormTypeInputProps) => (
          <ErrorBoundary>
            <Component {...props} />
          </ErrorBoundary>
        ),
      };
    });
  }, [formTypeInputMap, formTypeInputDefinitions]);

  return (
    <FormTypeInputsContext.Provider value={mergedFormTypeInputDefinitions}>
      {children}
    </FormTypeInputsContext.Provider>
  );
};
