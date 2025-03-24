import type { MutableRefObject } from 'react';

import Ajv, { type Options } from 'ajv';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

const defaultSettings: Options = {
  allErrors: true,
  strictSchema: false,
  validateFormats: false,
};

const ajvRef: MutableRefObject<Ajv | null> = {
  current: null,
};

export const ajvHelper = {
  get instance() {
    if (!ajvRef.current) {
      ajvRef.current = new Ajv(defaultSettings);
    }
    return ajvRef.current!;
  },
  compile({
    jsonSchema,
    ajv,
  }: {
    jsonSchema: JsonSchemaWithVirtual;
    ajv?: Ajv;
  }) {
    return (ajv || ajvHelper.instance).compile({ ...jsonSchema, $async: true });
  },
};

export type { ValidateFunction, ErrorObject, Ajv } from 'ajv';
