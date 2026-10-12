import type { SchemaFormPlugin } from '@canard/schema-form';

import { ajvValidatorPlugin } from './validator/validatorPlugin';

/** Published schema-form plugin containing the Ajv 6 validator. */
export const plugin: { validator: typeof ajvValidatorPlugin } = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './validator/createValidatorFactory';
