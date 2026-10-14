import type { SchemaFormPlugin } from '../../../src';
import { ajvValidatorPlugin } from './validatorPlugin';

/** Consumer registration uses the public plugin contract. */
export const plugin = {
  validator: ajvValidatorPlugin,
} satisfies SchemaFormPlugin;

export { ajvValidatorPlugin } from './validatorPlugin';
