import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
} from '@winglet/common-utils';

import type { ErrorObject } from '@/schema-form/helpers/ajv';

export enum ShowError {
  /** Always show error */
  Always = BIT_FLAG_00,
  /** Never show error */
  Never = BIT_FLAG_01,
  /** Show error when the input's value is updated */
  Dirty = BIT_FLAG_02,
  /** Show error when the input is touched */
  Touched = BIT_FLAG_03,
  /** Show error when the input's value is updated and touched */
  DirtyTouched = BIT_FLAG_04,
}

export interface JsonSchemaError extends ErrorObject {
  key?: number;
  dataPath: string;
  params: ErrorParameters;
  [alt: string]: any;
}

// NOTE: possible ajv error parameters
type ErrorParameters = Partial<{
  ref: string;
  limit: number | string;
  additionalProperty: string;
  property: string;
  missingProperty: string;
  depsCount: number;
  deps: string;
  format: string;
  comparison: string;
  exclusive: boolean;
  multipleOf: number;
  pattern: string;
  type: string;
  keyword: string;
  missingPattern: string;
  propertyName: string;
  failingKeyword: string;
  caseIndex: number;
  allowedValues: any[];
  [alt: string]: any;
}>;
