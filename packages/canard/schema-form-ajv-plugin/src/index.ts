import type { SchemaFormPlugin } from 'canard/schema-form/dist';

import { ajvValidatorPlugin } from './validator/validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './validator/createValidatorFactory';
