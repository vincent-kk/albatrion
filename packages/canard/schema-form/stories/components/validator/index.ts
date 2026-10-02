import type { SchemaFormPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from './validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './createValidatorFactory';
