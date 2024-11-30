import { type PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@lumy/schema-form/components/Form';
import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import {
  normalizeFormTypeInputDefinitions,
  normalizeFormTypeInputMap,
} from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type { FormTypeInputProps } from '@lumy/schema-form/types';

import { FormTypeInputsContext } from './FormTypeInputsContext';

interface FormTypeInputsContextProviderProps {
  /** FormTypeInput 정의 목록 */
  formTypeInputDefinitions?: FormProps['formTypeInputDefinitions'];
  /** FormTypeInput 경로 매핑 */
  formTypeInputMap?: FormProps['formTypeInputMap'];
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
