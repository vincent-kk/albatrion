import type { ErrorObject } from '@/schema-form/helpers/ajv';

export enum ShowError {
  Always = 1 << 0,
  Never = 1 << 1,
  Dirty = 1 << 2,
  Touched = 1 << 3,
  DirtyTouched = 1 << 4,
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
