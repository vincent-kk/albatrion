import type { ErrorObject } from 'ajv';

export const enum ShowError {
  Touched = 2 << 0,
  Dirty = 2 << 1,
}

export interface JsonSchemaError extends ErrorObject {
  key?: number;
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
