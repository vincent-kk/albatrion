import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';
import type Ajv from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { disposeSchemaRoot } from './utils/disposeSchemaRoot';
import { registerSchemaGuard } from './utils/registerSchemaGuard';
import {
  type SchemaRootRegistration,
  registerSchemaRoot,
} from './utils/registerSchemaRoot';
import { releaseSchemaRoot } from './utils/releaseSchemaRoot';

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
 * @returns An object satisfying the core validator contract, independent of `plugin.validator`
 * @throws ValidatorBindRefusedError when `coerceTypes`, `useDefaults` or `removeAdditional` is enabled
 */
export const createValidator = (
  ajv: Ajv.Ajv,
  options: InstanceValidatorOptions = {},
): ValidatorFactory => {
  assertBindableInstance(ajv);
  const directGuardCompile = options.directGuardCompile ?? true;
  const roots = new WeakMap<object, SchemaRootRegistration>();
  const active: WeakRef<SchemaRootRegistration>[] = [];
  const finalizer = new FinalizationRegistry<SchemaRootRegistration>(
    disposeSchemaRoot,
  );
  return {
    compile: (jsonSchema: JSONSchema) => {
      const registered = registerSchemaRoot(
        jsonSchema,
        ajv,
        roots,
        active,
        finalizer,
      );
      const validate = createValidatorFactory(
        registered.validation,
        registered.validationCopy ? registered.key : undefined,
      )(jsonSchema);
      return async (value: unknown) => validate(value);
    },
    compileGuard: (root: JSONSchema, pointer: string) => {
      const registered = registerSchemaRoot(
        root,
        ajv,
        roots,
        active,
        finalizer,
      );
      registerSchemaGuard(root, ajv, registered);
      return createGuardCompiler(
        registered,
        pointer,
        root,
        directGuardCompile,
        finalizer,
      );
    },
    release: (root: JSONSchema) =>
      releaseSchemaRoot(root, roots, active, finalizer),
    dialect: 'http://json-schema.org/draft-07/schema#',
  } satisfies ValidatorFactory;
};
