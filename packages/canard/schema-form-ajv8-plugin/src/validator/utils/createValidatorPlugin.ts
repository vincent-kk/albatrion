import type { ValidatorPlugin } from '@canard/schema-form';
import type { Ajv, Options } from 'ajv';

import { createInstanceValidator } from '../createInstanceValidator';
import type { SchemaRootRegistry } from './registerSchemaRoot';

/** Shared default profile for the three dialect entry points. */
const defaultSettings: Options = {
  allErrors: true,
  strict: false,
  validateFormats: false,
  allowUnionTypes: true,
  multipleOfPrecision: 9,
};

/**
 * Creates one dialect entry point with its own binding and guard policy.
 * @param Constructor - Native constructor for the selected dialect.
 * @param dialect - Schema URI exposed to the form engine.
 * @returns The configurable plugin validator for that dialect.
 */
export const createValidatorPlugin = <Instance extends Ajv>(
  Constructor: new (options: Options) => Instance,
  dialect: string,
) => {
  const roots: SchemaRootRegistry = new WeakMap();
  let validator: ReturnType<typeof createInstanceValidator> | undefined;
  let directGuardCompile = true;
  const makeValidator = (instance: Instance) =>
    createInstanceValidator(instance, dialect, undefined, roots, () => directGuardCompile);
  const getValidator = () => validator ??= makeValidator(new Constructor(defaultSettings));
  return {
    configure: (options: { directGuardCompile?: boolean }) => {
      directGuardCompile = options.directGuardCompile ?? directGuardCompile;
    },
    bind: (instance: Instance) => { validator = makeValidator(instance); },
    compile: (schema) => getValidator().compile(schema),
    compileGuard: (root, pointer) => getValidator().compileGuard(root, pointer),
    release: (root) => validator?.release(root),
    dialect,
  } satisfies ValidatorPlugin & { configure(options: { directGuardCompile?: boolean }): void };
};
