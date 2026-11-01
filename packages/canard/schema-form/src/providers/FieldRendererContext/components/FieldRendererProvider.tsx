import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { useConstant } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import { ShowError } from '@/schema-form/types';

import { useExternalFormContext } from '../../ExternalFormContext';
import { createShowErrorChecker } from '../utils/createShowErrorChecker';
import { FieldRendererContext } from './FieldRendererContext';

const DEFAULT_SHOW_ERROR = ShowError.EditedTouched;

interface FieldRendererContextProviderProps {
  /** Custom field renderer component */
  FieldRenderer?: FormProps['FieldRenderer'];
  FormLabelRenderer?: FormProps['FormLabelRenderer'];
  FormInputRenderer?: FormProps['FormInputRenderer'];
  FormErrorRenderer?: FormProps['FormErrorRenderer'];
  /** Custom format error function */
  formatError?: FormProps['formatError'];
  /**
   * Error display condition (default: ShowError.EditedTouched)
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Edited`: Show after user input edits the field
   *   - `ShowError.Touched`: Show errors after the input has lost focus once
   *   - `ShowError.EditedTouched`: Show after user input edits the field and the field was touched
   */
  showError?: FormProps['showError'];
}

export const FieldRendererContextProvider = ({
  FieldRenderer,
  FormLabelRenderer,
  FormInputRenderer,
  FormErrorRenderer,
  formatError,
  showError: inputShowError,
  children,
}: PropsWithChildren<FieldRendererContextProviderProps>) => {
  const {
    FieldRenderer: ExternalFormFieldRenderer,
    formatError: externalFormatError,
    showError: externalShowError,
  } = useExternalFormContext();

  const showError = inputShowError ?? externalShowError ?? DEFAULT_SHOW_ERROR;
  const checkShowError = useMemo(
    () => createShowErrorChecker(showError),
    [showError],
  );
  const constant = useConstant({
    FieldRenderer,
    FormLabelRenderer,
    FormInputRenderer,
    FormErrorRenderer,
    formatError,
  });
  const value = useMemo(() => {
    const FieldRenderer = isReactComponent(constant.FieldRenderer)
      ? constant.FieldRenderer
      : ExternalFormFieldRenderer;
    const formatError = isFunction(constant.formatError)
      ? constant.formatError
      : externalFormatError;
    return {
      FieldRenderer,
      FormLabelRenderer: constant.FormLabelRenderer,
      FormInputRenderer: constant.FormInputRenderer,
      FormErrorRenderer: constant.FormErrorRenderer,
      formatError,
      checkShowError,
      showError,
    };
  }, [
    constant,
    checkShowError,
    ExternalFormFieldRenderer,
    externalFormatError,
    showError,
  ]);

  return (
    <FieldRendererContext.Provider value={value}>
      {children}
    </FieldRendererContext.Provider>
  );
};
