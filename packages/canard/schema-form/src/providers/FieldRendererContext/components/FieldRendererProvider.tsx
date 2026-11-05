import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { useConstant } from '@winglet/react-utils/hook';

import type { FormProps } from '@/schema-form/components/Form';
import { ErrorVisibility } from '@/schema-form/types';

import { useExternalFormContext } from '../../ExternalFormContext';
import { createErrorVisibilityChecker } from '../utils/createErrorVisibilityChecker';
import { FieldRendererContext } from './FieldRendererContext';

const DEFAULT_ERROR_VISIBILITY = ErrorVisibility.AfterEditAndTouch;

interface FieldRendererContextProviderProps {
  /** Custom field renderer component */
  FieldRenderer?: FormProps['FieldRenderer'];
  FormLabelRenderer?: FormProps['FormLabelRenderer'];
  FormInputRenderer?: FormProps['FormInputRenderer'];
  FormErrorRenderer?: FormProps['FormErrorRenderer'];
  /** Custom format error function */
  formatError?: FormProps['formatError'];
  /**
   * Live display policy; defaults to AfterEditAndTouch after FormProvider fallback.
   * Always/Never, AfterEdit/AfterTouch, AfterEditAndTouch/AfterEditOrTouch are string enum values.
   * Node ErrorVisibility overrides precede the policy, without bypassing presence or OnChange release.
   */
  errorVisibility?: FormProps['errorVisibility'];
}

export const FieldRendererContextProvider = ({
  FieldRenderer,
  FormLabelRenderer,
  FormInputRenderer,
  FormErrorRenderer,
  formatError,
  errorVisibility: inputErrorVisibility,
  children,
}: PropsWithChildren<FieldRendererContextProviderProps>) => {
  const {
    FieldRenderer: ExternalFormFieldRenderer,
    formatError: externalFormatError,
    errorVisibility: externalErrorVisibility,
  } = useExternalFormContext();

  const errorVisibility =
    inputErrorVisibility ?? externalErrorVisibility ?? DEFAULT_ERROR_VISIBILITY;
  const checkErrorVisibility = useMemo(
    () => createErrorVisibilityChecker(errorVisibility),
    [errorVisibility],
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
      checkErrorVisibility,
      errorVisibility,
    };
  }, [
    constant,
    checkErrorVisibility,
    ExternalFormFieldRenderer,
    externalFormatError,
    errorVisibility,
  ]);

  return (
    <FieldRendererContext.Provider value={value}>
      {children}
    </FieldRendererContext.Provider>
  );
};
