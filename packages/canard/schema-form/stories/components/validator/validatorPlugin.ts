import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv/dist/2020';

import { createValidatorFactory } from './createValidatorFactory';

const defaultSettings: Options = {
  allErrors: true,
  strictSchema: false,
  validateFormats: false,
};

let ajvInstance: Ajv | null = null;

export const ajvValidatorPlugin: ValidatorPlugin = {
  bind: (instance: Ajv) => (ajvInstance = instance),
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    return createValidatorFactory(ajvInstance)(jsonSchema);
  },
};
