import { type ComponentType, type PropsWithChildren, useMemo } from 'react';

import type { ValidationMode } from '@/schema-form/core';
import type { Ajv } from '@/schema-form/helpers/ajv';
import { normalizeFormTypeInputDefinitions } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ShowError,
} from '@/schema-form/types';

import { ExternalFormContext } from './ExternalFormContext';

export interface ExternalFormContextProviderProps {
  /** 외부에서 선언된 FormTypeInputDefinition 목록 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** 외부에서 선언된 FormGroupRenderer */
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  /** 외부에서 선언된 FormLabelRenderer */
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  /** 외부에서 선언된 FormInputRenderer */
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  /** 외부에서 선언된 FormErrorRenderer */
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  /** 외부에서 선언된 FormatError */
  formatError?: FormatError;
  /**
   * Error display condition (default: ShowError.Dirty | ShowError.Touched)
   *   - `true`: 항상 노출
   *   - `false`: 항상 미노출
   *   - `ShowError.Dirty`: 값이 변경된 경우 노출
   *   - `ShowError.Touched`: input에 focus 된 경우 노출
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
   *  - `ValidationMode.None`: 유효성 검증 비활성화
   *  - `ValidationMode.OnChange`: 값이 변경될 때 유효성 검증
   *  - `ValidationMode.OnRequest`: 요청할 때 유효성 검증
   */
  validationMode?: ValidationMode;
  /** 외부에서 선언된 Ajv 인스턴스, 없으면 내부에서 생성 */
  ajv?: Ajv;
}

export const ExternalFormContextProvider = ({
  formTypeInputDefinitions,
  FormGroupRenderer,
  FormLabelRenderer,
  FormInputRenderer,
  FormErrorRenderer,
  formatError,
  showError,
  validationMode,
  ajv,
  children,
}: PropsWithChildren<ExternalFormContextProviderProps>) => {
  const value = useMemo(
    () => ({
      fromExternalFormTypeInputDefinitions: formTypeInputDefinitions
        ? normalizeFormTypeInputDefinitions(formTypeInputDefinitions)
        : undefined,
      FormGroupRenderer,
      FormLabelRenderer,
      FormInputRenderer,
      FormErrorRenderer,
      formatError,
      showError,
      validationMode,
      ajv,
    }),
    [
      formTypeInputDefinitions,
      FormGroupRenderer,
      FormLabelRenderer,
      FormInputRenderer,
      FormErrorRenderer,
      formatError,
      showError,
      validationMode,
      ajv,
    ],
  );
  return (
    <ExternalFormContext.Provider value={value}>
      {children}
    </ExternalFormContext.Provider>
  );
};
