import type { SchemaFormPlugin } from '@canard/schema-form';

import { ajvValidatorPlugin, createValidatorFactory } from './validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory };
