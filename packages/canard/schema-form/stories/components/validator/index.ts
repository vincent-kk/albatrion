import type { SchemaFormPlugin } from '../../../src';
import { ajvValidatorPlugin } from './validatorPlugin';

export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { createValidatorFactory } from './createValidatorFactory';
