import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils';
import { isReactComponent } from '@winglet/react-utils';

import type { FormProps } from '@/schema-form/components/Form';
import { ShowError } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { FormTypeRendererContext } from './FormTypeRendererContext';

interface FormTypeRendererContextProviderProps {
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: FormProps['CustomFormTypeRenderer'];
  /** Custom format error function */
  formatError?: FormProps['formatError'];
  /**
   * Error display condition
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   */
  showError?: FormProps['showError'];
}

export const FormTypeRendererContextProvider = ({
  CustomFormTypeRenderer,
  formatError: inputFormatError,
  showError,
  children,
}: PropsWithChildren<FormTypeRendererContextProviderProps>) => {
  const {
    FormGroupRenderer: ExternalFormGroupRenderer,
    formatError: externalFormatError,
  } = useExternalFormContext();

  const checkShowError = useMemo<
    FormTypeRendererContext['checkShowError']
  >(() => {
    const errorState =
      typeof showError === 'boolean'
        ? showError
          ? ALWAYS_BITMASK
          : NEVER_BITMASK
        : showError || 0;
    return ({
      dirty,
      touched,
    }: Parameters<FormTypeRendererContext['checkShowError']>[0]) => {
      if (errorState & ALWAYS_BITMASK) return true;
      if (errorState & NEVER_BITMASK) return false;
      if (errorState & ShowError.Dirty && !dirty) return false;
      if (errorState & ShowError.Touched && !touched) return false;
      return true;
    };
  }, [showError]);

  const value = useMemo(() => {
    const FormTypeRenderer = isReactComponent(CustomFormTypeRenderer)
      ? CustomFormTypeRenderer
      : ExternalFormGroupRenderer;
    const formatError = isFunction(inputFormatError)
      ? inputFormatError
      : externalFormatError;
    return {
      FormTypeRenderer,
      formatError,
      checkShowError,
    };
  }, [
    CustomFormTypeRenderer,
    ExternalFormGroupRenderer,
    externalFormatError,
    inputFormatError,
    checkShowError,
  ]);

  return (
    <FormTypeRendererContext.Provider value={value}>
      {children}
    </FormTypeRendererContext.Provider>
  );
};

const ALWAYS_BITMASK = 0b1000 as const;
const NEVER_BITMASK = 0b0100 as const;
