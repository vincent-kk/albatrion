import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';
import type Ajv from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import type { SchemaRootRegistry } from './utils/registerSchemaRoot';

/** Per-object selections of a validator built from one AJV instance. */
export interface InstanceValidatorOptions {
  /** Compile self-contained guards directly (default true); false uses root pointers. */
  directGuardCompile?: boolean;
}

/**
 * Build a validator object for one AJV 6 instance, for a Form's `validatorFactory`.
 * The instance is refused like `bind` when it would modify values (LANDING-192),
 * and the object owns its own root registrations, so `release` and garbage
 * collection never touch the plugin's process-wide binding.
 * @param ajv - Instance supplying keywords and formats; must not coerce, default or remove
 * @param options - Per-object selections; omitted fields take their defaults
 * @param readDirectGuardCompile - Entry-point selection for later guards
 * @returns An object satisfying the core validator contract, independent of `plugin.validator`
 * @throws ValidatorBindRefusedError when `coerceTypes`, `useDefaults` or `removeAdditional` is enabled
 */
export const createValidator = (
  ajv: Ajv.Ajv,
  options: InstanceValidatorOptions = {},
  readDirectGuardCompile?: () => boolean,
) => {
  assertBindableInstance(ajv);
  const directGuardCompile = options.directGuardCompile ?? true;
  const roots: SchemaRootRegistry = new WeakMap();
  return {
    compile: createValidatorFactory(ajv, undefined, roots),
    compileGuard: (root: JSONSchema, pointer: string) =>
      createGuardCompiler(ajv, roots, pointer, root, readDirectGuardCompile?.() ?? directGuardCompile),
    release: (root: JSONSchema) => { roots.delete(root); },
    dialect: 'http://json-schema.org/draft-07/schema#',
  } satisfies ValidatorFactory;
};
