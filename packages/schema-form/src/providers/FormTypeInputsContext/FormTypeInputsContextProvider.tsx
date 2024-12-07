import { type PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@/schema-form/components/Form';
import {
  normalizeFormTypeInputDefinitions,
  normalizeFormTypeInputMap,
} from '@/schema-form/helpers/formTypeInputDefinition';

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
