import type { ValidatorFactory } from '@canard/schema-form';
import type Ajv2020 from 'ajv/dist/2020.js';

import {
  type InstanceValidatorOptions,
  createInstanceValidator,
} from '../validator/createInstanceValidator';

/**
 * Build a validator object for one AJV instance under this entry point's dialect,
 * for a Form's `validatorFactory`; the instance is refused like `bind` when it
 * would modify values, and the object owns its own root registry.
 * @param ajv - Instance supplying keywords and formats; must not coerce, default or remove
 * @param options - Per-object selections such as `directGuardCompile` (default true)
 * @returns An object satisfying the core validator contract, independent of `plugin.validator`
 * @throws ValidatorBindRefusedError when `coerceTypes`, `useDefaults` or `removeAdditional` is enabled
 */
export const createValidator = (
  ajv: Ajv2020,
  options?: InstanceValidatorOptions,
): ValidatorFactory =>
  createInstanceValidator(
    ajv,
    'https://json-schema.org/draft/2020-12/schema',
    options,
  );
