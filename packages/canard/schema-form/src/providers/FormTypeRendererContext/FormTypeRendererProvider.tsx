import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { useMemorize } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import { ShowError } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { FormTypeRendererContext } from './FormTypeRendererContext';

const DEFAULT_SHOW_ERROR = ShowError.DirtyTouched;

interface FormTypeRendererContextProviderProps {
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: FormProps['CustomFormTypeRenderer'];
  /** Custom format error function */
  formatError?: FormProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Dirty`: Show errors when value has changed
   *   - `ShowError.Touched`: Show errors when input has been focused
   *   - `ShowError.DirtyTouched`: Show errors when both Dirty and Touched states are met
   */
  showError?: FormProps['showError'];
}

export const FormTypeRendererContextProvider = ({
  CustomFormTypeRenderer,
  formatError,
  showError: inputShowError,
  children,
}: PropsWithChildren<FormTypeRendererContextProviderProps>) => {
  const {
    FormGroupRenderer: ExternalFormGroupRenderer,
    formatError: externalFormatError,
    showError: externalShowError,
  } = useExternalFormContext();

  const checkShowError = useMemo<
    FormTypeRendererContext['checkShowError']
  >(() => {
    const showError = inputShowError ?? externalShowError ?? DEFAULT_SHOW_ERROR;
    const errorState =
      typeof showError === 'boolean'
        ? showError
          ? ShowError.Always
          : ShowError.Never
        : showError;
    return ({
      dirty,
      touched,
      showError,
    }: Parameters<FormTypeRendererContext['checkShowError']>[0]) => {
      if (showError !== undefined) return showError;
      if (errorState & ShowError.Always) return true;
      if (errorState & ShowError.Never) return false;
      if (errorState & ShowError.Dirty && dirty) return true;
      if (errorState & ShowError.Touched && touched) return true;
      if (errorState & ShowError.DirtyTouched && dirty && touched) return true;
      return false;
    };
  }, [inputShowError, externalShowError]);

  const memoized = useMemorize({
    CustomFormTypeRenderer,
    formatError,
  });
  const value = useMemo(() => {
    const FormTypeRenderer = isReactComponent(memoized.CustomFormTypeRenderer)
      ? memoized.CustomFormTypeRenderer
      : ExternalFormGroupRenderer;
    const formatError = isFunction(memoized.formatError)
      ? memoized.formatError
      : externalFormatError;
    return {
      FormTypeRenderer,
      formatError,
      checkShowError,
    };
  }, [
    memoized,
    checkShowError,
    ExternalFormGroupRenderer,
    externalFormatError,
  ]);

  return (
    <FormTypeRendererContext.Provider value={value}>
      {children}
    </FormTypeRendererContext.Provider>
  );
};
