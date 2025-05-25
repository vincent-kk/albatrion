import { type PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@/schema-form/components/Form';
import {
  normalizeFormTypeInputDefinitions,
  normalizeFormTypeInputMap,
} from '@/schema-form/helpers/formTypeInputDefinition';

import { FormTypeInputsContext } from './FormTypeInputsContext';

interface FormTypeInputsContextProviderProps {
  /** List of FormTypeInput definitions */
  formTypeInputDefinitions?: FormProps['formTypeInputDefinitions'];
  /** FormTypeInput path mapping */
  formTypeInputMap?: FormProps['formTypeInputMap'];
}

export const FormTypeInputsContextProvider = ({
  formTypeInputDefinitions,
  formTypeInputMap,
  children,
}: PropsWithChildren<FormTypeInputsContextProviderProps>) => {
  const value = useMemo(
    () => ({
      fromFormTypeInputDefinitions: normalizeFormTypeInputDefinitions(
        formTypeInputDefinitions,
      ),
      fromFormTypeInputMap: normalizeFormTypeInputMap(formTypeInputMap),
    }),
    [formTypeInputDefinitions, formTypeInputMap],
  );
  return (
    <FormTypeInputsContext.Provider value={value}>
      {children}
    </FormTypeInputsContext.Provider>
  );
};
