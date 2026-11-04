import type { ValidatorFactory } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';

import { createValidator } from '../../createValidator';
import { ajvValidatorPlugin } from '../../validatorPlugin';

/**
 * Prepare an AJV 7 validator over a new Ajv 2019 instance, the only binding with dynamic references.
 * @param mode - `plugin` binds the process-wide plugin; `instance` builds a validator object for the instance.
 * @param directGuardCompile - The guard compile path selected for later compiles.
 * @returns The validator whose `compile`, `compileGuard` and `release` share one registry.
 */
export const loadDynamicScopeValidator = (
  mode: 'plugin' | 'instance',
  directGuardCompile: boolean,
): ValidatorFactory => {
  const instance = new Ajv2019({ allErrors: true, strict: false, validateFormats: false });
  if (mode === 'instance') return createValidator(instance, { directGuardCompile });
  ajvValidatorPlugin.bind?.(instance);
  ajvValidatorPlugin.configure({ directGuardCompile });
  return ajvValidatorPlugin;
};
