import { type PropsWithChildren, useMemo } from 'react';

import { useConstant } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import {
  normalizeFieldInputDefinitions,
  normalizeFieldInputMap,
} from '@/schema-form/helpers/fieldInputDefinition';

import { FieldInputsContext } from './FieldInputsContext';

interface FieldInputsContextProviderProps {
  /** List of FieldInput definitions */
  fieldInputDefinitions?: FormProps['fieldInputDefinitions'];
  /** FieldInput path mapping */
  fieldInputMap?: FormProps['fieldInputMap'];
}

export const FieldInputsContextProvider = ({
  fieldInputDefinitions,
  fieldInputMap,
  children,
}: PropsWithChildren<FieldInputsContextProviderProps>) => {
  const constant = useConstant({
    fieldInputDefinitions,
    fieldInputMap,
  });
  const value = useMemo(
    () => ({
      fromFieldInputDefinitions: normalizeFieldInputDefinitions(
        constant.fieldInputDefinitions,
      ),
      fromFieldInputMap: normalizeFieldInputMap(constant.fieldInputMap),
    }),
    [constant],
  );
  return (
    <FieldInputsContext.Provider value={value}>
      {children}
    </FieldInputsContext.Provider>
  );
};
