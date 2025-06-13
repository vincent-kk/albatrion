import type { SchemaFormPlugin } from '@canard/schema-form';

import { ajvValidatorPlugin } from './validator/validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './validator/createValidatorFactory';
