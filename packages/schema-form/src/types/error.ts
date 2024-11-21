import type { ErrorObject } from '@lumy/schema-form/helpers/ajv';

export enum ShowError {
  Touched = 1 << 0,
  Dirty = 1 << 1,
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
