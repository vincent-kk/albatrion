import {
  type PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import type { FormProps } from '@/schema-form/components/Form';
import { FormErrorCode, isSchemaFormError } from '@/schema-form/errors';
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
  const fromFieldInputDefinitions = useMemo(
    () => normalizeFieldInputDefinitions(fieldInputDefinitions),
    [fieldInputDefinitions],
  );
  const normalizedMap = useMemo(() => {
    try {
      return { fromFieldInputMap: normalizeFieldInputMap(fieldInputMap) };
    } catch (error) {
      if (
        !isSchemaFormError(error) ||
        error.code !== FormErrorCode.FormTypeInputMap
      )
        throw error;
      return {
        fromFieldInputMap: normalizeFieldInputMap(),
        inputMapError: error,
      };
    }
  }, [fieldInputMap]);
  const committedMap = useRef(normalizedMap.fromFieldInputMap);
  useLayoutEffect(() => {
    if (!normalizedMap.inputMapError)
      committedMap.current = normalizedMap.fromFieldInputMap;
  }, [normalizedMap]);
  const fromFieldInputMap = normalizedMap.inputMapError
    ? committedMap.current
    : normalizedMap.fromFieldInputMap;
  const value = useMemo<FieldInputsContext>(
    () => ({
      fromFieldInputDefinitions,
      fromFieldInputMap,
      inputMapError: normalizedMap.inputMapError,
    }),
    [fromFieldInputDefinitions, fromFieldInputMap, normalizedMap.inputMapError],
  );
  return (
    <FieldInputsContext.Provider value={value}>
      {children}
    </FieldInputsContext.Provider>
  );
};
