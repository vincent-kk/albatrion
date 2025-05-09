import type { ErrorObject } from '@/schema-form/helpers/ajv';

import {
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
  BIT_FLAG_05,
} from '../app/constants/binary';

export enum ShowError {
  Always = BIT_FLAG_01,
  Never = BIT_FLAG_02,
  Dirty = BIT_FLAG_03,
  Touched = BIT_FLAG_04,
  DirtyTouched = BIT_FLAG_05,
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
