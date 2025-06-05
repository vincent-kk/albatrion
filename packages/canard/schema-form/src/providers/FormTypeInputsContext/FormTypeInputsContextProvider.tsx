import { type PropsWithChildren, useMemo } from 'react';

import { useMemorize } from '@winglet/react-utils';

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
  const memoized = useMemorize({
    formTypeInputDefinitions,
    formTypeInputMap,
  });
  const value = useMemo(
    () => ({
      fromFormTypeInputDefinitions: normalizeFormTypeInputDefinitions(
        memoized.formTypeInputDefinitions,
      ),
      fromFormTypeInputMap: normalizeFormTypeInputMap(
        memoized.formTypeInputMap,
      ),
    }),
    [memoized],
  );
  return (
    <FormTypeInputsContext.Provider value={value}>
      {children}
    </FormTypeInputsContext.Provider>
  );
};
