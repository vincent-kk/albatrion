import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import { FallbackFormatError } from '@lumy/schema-form/components/FallbackComponents/FallbackFormatError';
import { FallbackSchemaNodeRenderer } from '@lumy/schema-form/components/FallbackComponents/FallbackSchemaNodeRenderer';
import { isComponentType, isFunction } from '@lumy/schema-form/helpers/filter';
import {
  type SchemaNodeRendererProps,
  ShowError,
} from '@lumy/schema-form/types';

import { SchemaNodeRendererContext } from './SchemaNodeRendererContext';

export interface SchemaNodeRendererContextProviderProps {
  /** Custom form type renderer component */
  CustomSchemaNodeRenderer: ComponentType<SchemaNodeRendererProps>;
  /** Custom format error function */
  formatError: SchemaNodeRendererProps['formatError'];
  /**
   * Error display condition
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   */
  showError?: boolean | ShowError;
}

export const SchemaNodeRendererContextProvider = ({
  CustomSchemaNodeRenderer,
  formatError: customFormatError,
  showError,
  children,
}: PropsWithChildren<SchemaNodeRendererContextProviderProps>) => {
  const SchemaNodeRenderer = useMemo<
    SchemaNodeRendererContext['SchemaNodeRenderer']
  >(
    () =>
      isComponentType(CustomSchemaNodeRenderer)
        ? CustomSchemaNodeRenderer
        : FallbackSchemaNodeRenderer,
    [CustomSchemaNodeRenderer],
  );

  const formatError = useMemo<SchemaNodeRendererContext['formatError']>(
    () =>
      isFunction(customFormatError) ? customFormatError : FallbackFormatError,
    [customFormatError],
  );

  const checkShowError = useMemo<
    SchemaNodeRendererContext['checkShowError']
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
    }: Parameters<SchemaNodeRendererContext['checkShowError']>[0]) => {
      if (errorState & ALWAYS_BITMASK) return true;
      if (errorState & NEVER_BITMASK) return false;
      if (errorState & ShowError.Dirty && !dirty) return false;
      if (errorState & ShowError.Touched && !touched) return false;
      return true;
    };
  }, [showError]);

  return (
    <SchemaNodeRendererContext.Provider
      value={{
        SchemaNodeRenderer,
        formatError,
        checkShowError,
      }}
    >
      {children}
    </SchemaNodeRendererContext.Provider>
  );
};

const ALWAYS_BITMASK = 0b1000 as const;
const NEVER_BITMASK = 0b0100 as const;
