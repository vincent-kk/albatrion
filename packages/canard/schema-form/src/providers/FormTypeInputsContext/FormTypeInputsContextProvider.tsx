import { type PropsWithChildren, useMemo } from 'react';

import { useConstant } from '@winglet/react-utils/hook';

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
  const constant = useConstant({
    formTypeInputDefinitions,
    formTypeInputMap,
  });
  const value = useMemo(
    () => ({
      fromFormTypeInputDefinitions: normalizeFormTypeInputDefinitions(
        constant.formTypeInputDefinitions,
      ),
      fromFormTypeInputMap: normalizeFormTypeInputMap(
        constant.formTypeInputMap,
      ),
    }),
    [constant],
  );
  return (
    <FormTypeInputsContext.Provider value={value}>
      {children}
    </FormTypeInputsContext.Provider>
  );
};
