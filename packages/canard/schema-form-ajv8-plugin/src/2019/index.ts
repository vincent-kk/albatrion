import type { SchemaFormPlugin } from '@canard/schema-form';

import { ajvValidatorPlugin, createValidatorFactory } from './validatorPlugin';

// Keep the public declaration tied to the explicit dialect import in validatorPlugin.
export const plugin: { validator: typeof ajvValidatorPlugin } = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory };
export { createValidator } from './createValidator';
