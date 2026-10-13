import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';
import type Ajv from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { releaseSchemaRoot } from './utils/releaseSchemaRoot';

/** Per-object selections of a validator built from one AJV instance. */
export interface InstanceValidatorOptions {
  /** Compile self-contained guards directly (default true); false uses root pointers. */
  directGuardCompile?: boolean;
}

/**
 * Build a validator object for one AJV instance, for a Form's `validatorFactory`.
 * The instance is refused like `bind` when it would modify values (LANDING-192),
 * and the object owns its own root registry, so `release` and garbage collection
 * never touch the entry point's process-wide registrations.
 * @param ajv - Instance supplying keywords and formats; must not coerce, default or remove
 * @param dialect - Dialect URI of the entry point that constructs the object
 * @param options - Per-object selections; omitted fields take their defaults
 * @returns An object satisfying the core validator contract, bound to this instance
 * @throws ValidatorBindRefusedError when `coerceTypes`, `useDefaults` or `removeAdditional` is enabled
 */
export const createInstanceValidator = (
  ajv: Ajv,
  dialect: string,
  options: InstanceValidatorOptions = {},
): ValidatorFactory => {
  assertBindableInstance(ajv);
  const roots = createSchemaRootRegistry();
  const directGuardCompile = options.directGuardCompile ?? true;
  return {
    compile: (jsonSchema: JSONSchema) =>
      createValidatorFactory(ajv, roots)(jsonSchema),
    compileGuard: (root: JSONSchema, pointer: string) =>
      createGuardCompiler(ajv, roots, root, pointer, directGuardCompile),
    release: (root: JSONSchema) => releaseSchemaRoot(roots, root),
    dialect,
  } satisfies ValidatorFactory;
};
