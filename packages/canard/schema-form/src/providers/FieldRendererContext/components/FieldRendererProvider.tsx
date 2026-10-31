import { type PropsWithChildren, useCallback, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { useConstant } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import { ShowError } from '@/schema-form/types';

import { useExternalFormContext } from '../../ExternalFormContext';
import { createShowErrorChecker } from '../utils/createShowErrorChecker';
import { FieldRendererContext } from './FieldRendererContext';

const DEFAULT_SHOW_ERROR = ShowError.DirtyTouched;

interface FieldRendererContextProviderProps {
  /** Custom field renderer component */
  FieldRenderer?: FormProps['FieldRenderer'];
  FormLabelRenderer?: FormProps['FormLabelRenderer'];
  FormInputRenderer?: FormProps['FormInputRenderer'];
  FormErrorRenderer?: FormProps['FormErrorRenderer'];
  /** Custom format error function */
  formatError?: FormProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show errors
   *   - `false`: Never show errors
   *   - `ShowError.Dirty`: Show errors when value has changed
   *   - `ShowError.Touched`: Show errors after the input has lost focus once
   *   - `ShowError.DirtyTouched`: Show errors when both Dirty and Touched states are met
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

  const resolveShowError = useCallback(
    (policy: unknown) =>
      createShowErrorChecker(policy ?? externalShowError ?? DEFAULT_SHOW_ERROR),
    [externalShowError],
  );
  const checkShowError = useMemo(
    () => resolveShowError(inputShowError),
    [inputShowError, resolveShowError],
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
      resolveShowError,
    };
  }, [
    constant,
    checkShowError,
    ExternalFormFieldRenderer,
    externalFormatError,
    resolveShowError,
  ]);

  return (
    <FieldRendererContext.Provider value={value}>
      {children}
    </FieldRendererContext.Provider>
  );
};
