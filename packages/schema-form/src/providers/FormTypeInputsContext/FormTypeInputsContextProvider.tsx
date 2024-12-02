import { type PropsWithChildren, useMemo } from 'react';

import type { FormProps } from '@lumy/schema-form/components/Form';
import {
  normalizeFormTypeInputDefinitions,
  normalizeFormTypeInputMap,
} from '@lumy/schema-form/helpers/formTypeInputDefinition';

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
  const fromFormTypeInputDefinitions = useMemo(
    () => normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
    [formTypeInputDefinitions],
  );

  const fromFormTypeInputMap = useMemo(
    () => normalizeFormTypeInputMap(formTypeInputMap),
    [formTypeInputMap],
  );

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
