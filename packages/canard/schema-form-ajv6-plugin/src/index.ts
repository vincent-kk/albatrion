import type { JSONSchema, SchemaFormPlugin, ValidateFunction } from '@canard/schema-form';

import { createValidator as createInstanceValidator } from './validator/createValidator';
import { createValidatorFactory as createFactory } from './validator/createValidatorFactory';
import { ajvValidatorPlugin } from './validator/validatorPlugin';

/** Published schema-form plugin containing the Ajv 6 validator. */
export const plugin: { validator: typeof ajvValidatorPlugin } = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

/** Creates promise-returning validation with an optional application registration key. */
export const createValidatorFactory: (
  instance: Parameters<typeof createFactory>[0], key?: string,
) => (schema: JSONSchema) => ValidateFunction = createFactory;
export const createValidator: (
  ...args: [ajv: Parameters<typeof createInstanceValidator>[0], options?: Parameters<typeof createInstanceValidator>[1]]
) => import('@canard/schema-form').ValidatorFactory = createInstanceValidator;
