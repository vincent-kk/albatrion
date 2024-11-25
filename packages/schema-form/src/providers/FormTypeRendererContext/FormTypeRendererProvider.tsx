import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { FallbackFormatError } from '@lumy/schema-form/components/FallbackComponents/FallbackFormatError';
import { FormGroupRenderer as FallbackRenderer } from '@lumy/schema-form/components/FallbackComponents/FormGroupRenderer';
import { isFunction, isReactComponent } from '@lumy/schema-form/helpers/filter';
import { type FormTypeRendererProps, ShowError } from '@lumy/schema-form/types';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export interface FormTypeRendererContextProviderProps {
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** Custom format error function */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * Error display condition
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   */
  showError?: boolean | ShowError;
}

export const FormTypeRendererContextProvider = ({
  CustomFormTypeRenderer,
  formatError: customFormatError,
  showError,
  children,
}: PropsWithChildren<FormTypeRendererContextProviderProps>) => {
  const FormTypeRenderer = useMemo<FormTypeRendererContext['FormTypeRenderer']>(
    () =>
      isReactComponent(CustomFormTypeRenderer)
        ? CustomFormTypeRenderer
        : FallbackRenderer,
    [CustomFormTypeRenderer],
  );

  const formatError = useMemo<FormTypeRendererContext['formatError']>(
    () =>
      isFunction(customFormatError) ? customFormatError : FallbackFormatError,
    [customFormatError],
  );

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

  return (
    <FormTypeRendererContext.Provider
      value={{
        FormTypeRenderer,
        formatError,
        checkShowError,
      }}
    >
      {children}
    </FormTypeRendererContext.Provider>
  );
};

const ALWAYS_BITMASK = 0b1000 as const;
const NEVER_BITMASK = 0b0100 as const;
