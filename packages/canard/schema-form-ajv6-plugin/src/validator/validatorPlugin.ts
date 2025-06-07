import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv from 'ajv';

import { createValidatorFactory } from './createValidatorFactory';

const defaultSettings: Ajv.Options = {
  allErrors: true,
  verbose: true,
  format: false,
};

let ajvInstance: Ajv.Ajv | null = null;

export const ajvValidatorPlugin: ValidatorPlugin = {
  bind: (instance: Ajv.Ajv) => (ajvInstance = instance),
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    return createValidatorFactory(ajvInstance)(jsonSchema);
  },
};
