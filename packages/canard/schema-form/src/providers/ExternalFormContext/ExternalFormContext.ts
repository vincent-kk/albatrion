import { type ComponentType, createContext } from 'react';

import type { ValidationMode } from '@/schema-form/core';
import type { Ajv } from '@/schema-form/helpers/ajv';
import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeRendererProps,
  FormatError,
  ShowError,
} from '@/schema-form/types';

export interface ExternalFormContextProps {
  /** 외부에서 선언된 FormTypeInputDefinition 목록 */
  fromExternalFormTypeInputDefinitions?: NormalizedFormTypeInputDefinition[];
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

export const ExternalFormContext = createContext<ExternalFormContextProps>({});
