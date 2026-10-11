import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { useConstant } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import { ShowError } from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { FormTypeRendererContext } from './FormTypeRendererContext';

const DEFAULT_SHOW_ERROR = ShowError.DirtyTouched;

interface FormTypeRendererContextProviderProps {
  /** Custom form type renderer component */
  FormTypeGroupRenderer?: FormProps['FormTypeGroupRenderer'];
  FormTypeLabelRenderer?: FormProps['FormTypeLabelRenderer'];
  FormTypeInputRenderer?: FormProps['FormTypeInputRenderer'];
  FormTypeErrorRenderer?: FormProps['FormTypeErrorRenderer'];
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
  FormTypeGroupRenderer,
  FormTypeLabelRenderer,
  FormTypeInputRenderer,
  FormTypeErrorRenderer,
  formatError,
  showError: inputShowError,
  children,
}: PropsWithChildren<FormTypeRendererContextProviderProps>) => {
  const {
    FormTypeGroupRenderer: ExternalFormGroupRenderer,
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
    return (
      condition: Parameters<FormTypeRendererContext['checkShowError']>[0],
    ) => {
      const showError = condition?.[4],
        dirty = condition?.[1],
        touched = condition?.[2];
      if (showError !== undefined) return showError;
      if (errorState & ShowError.Always) return true;
      if (errorState & ShowError.Never) return false;
      if (errorState & ShowError.Dirty && dirty) return true;
      if (errorState & ShowError.Touched && touched) return true;
      if (errorState & ShowError.DirtyTouched && dirty && touched) return true;
      return false;
    };
  }, [inputShowError, externalShowError]);

  const constant = useConstant({
    FormTypeGroupRenderer,
    FormTypeLabelRenderer,
    FormTypeInputRenderer,
    FormTypeErrorRenderer,
    formatError,
  });
  const value = useMemo(() => {
    const FormTypeGroupRenderer = isReactComponent(
      constant.FormTypeGroupRenderer,
    )
      ? constant.FormTypeGroupRenderer
      : ExternalFormGroupRenderer;
    const formatError = isFunction(constant.formatError)
      ? constant.formatError
      : externalFormatError;
    return {
      FormTypeGroupRenderer,
      FormTypeLabelRenderer: constant.FormTypeLabelRenderer,
      FormTypeInputRenderer: constant.FormTypeInputRenderer,
      FormTypeErrorRenderer: constant.FormTypeErrorRenderer,
      formatError,
      checkShowError,
    };
  }, [
    constant,
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
