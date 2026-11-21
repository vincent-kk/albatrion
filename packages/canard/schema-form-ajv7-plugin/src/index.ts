import type { SchemaFormPlugin } from '@canard/schema-form';

import { createValidator as createInstanceValidator } from './validator/createValidator';
import { ajvValidatorPlugin } from './validator/validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './validator/createValidatorFactory';
export const createValidator: (
  ...args: [ajv: Parameters<typeof createInstanceValidator>[0], options?: Parameters<typeof createInstanceValidator>[1]]
) => import('@canard/schema-form').ValidatorFactory = createInstanceValidator;
