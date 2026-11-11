import { type PropsWithChildren, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';

import type { FormProps } from '@/schema-form/components/Form';
import { ErrorVisibility } from '@/schema-form/types';

import { useExternalFormContext } from '../../ExternalFormContext';
import { createErrorVisibilityChecker } from '../utils/createErrorVisibilityChecker';
import { FieldRendererContext } from './FieldRendererContext';

const DEFAULT_ERROR_VISIBILITY = ErrorVisibility.AfterEditAndTouch;

interface FieldRendererContextProviderProps {
  /** Custom field renderer component */
  FieldRenderer?: FormProps['FieldRenderer'];
  LabelRenderer?: FormProps['LabelRenderer'];
  InputRenderer?: FormProps['InputRenderer'];
  ErrorMessageRenderer?: FormProps['ErrorMessageRenderer'];
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
  LabelRenderer,
  InputRenderer,
  ErrorMessageRenderer,
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
  const value = useMemo(() => {
    const resolvedFieldRenderer = isReactComponent(FieldRenderer)
      ? FieldRenderer
      : ExternalFormFieldRenderer;
    const resolvedFormatError = isFunction(formatError)
      ? formatError
      : externalFormatError;
    return {
      FieldRenderer: resolvedFieldRenderer,
      LabelRenderer,
      InputRenderer,
      ErrorMessageRenderer,
      formatError: resolvedFormatError,
      checkErrorVisibility,
      errorVisibility,
    };
  }, [
    FieldRenderer,
    LabelRenderer,
    InputRenderer,
    ErrorMessageRenderer,
    formatError,
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
