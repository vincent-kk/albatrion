import type { ValidationIssue, ValidatorPlugin } from '@canard/schema-form';
import Ajv from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { registerSchemaRoot, type SchemaRootRegistration } from './utils/registerSchemaRoot';
import { registerSchemaGuard } from './utils/registerSchemaGuard';
import { disposeSchemaRoot } from './utils/disposeSchemaRoot';
import { releaseSchemaRoot } from './utils/releaseSchemaRoot';

/**
 * AJV6 defaults preserve the plugin's Draft-07 and format behavior.
 */
const defaultSettings: Ajv.Options = {
  allErrors: true,
  nullable: true,
  verbose: true,
  format: false,
};

/** The consumer binding is process-wide, as required by ValidatorPlugin.bind. */
let ajvInstance: Ajv.Ajv | null = null;
/** Process-wide optimization selection; existing predicates retain their behavior. */
let directGuardCompile = true;

/** Plugin-specific configuration extends the core contract without changing it. */
type ConfigurableValidatorPlugin = ValidatorPlugin & {
  /**
   * Select direct compilation of self-contained guards (default true).
   * @param options - False uses root pointers for later compiles; omitted fields
   * keep their value. Existing predicates and bound Ajv settings are unchanged.
   * @returns Nothing; updates this entry point's process-wide selection.
   */
  configure(options: { directGuardCompile?: boolean }): void;
};
/** Root registrations belong to the current binding. */
let roots = new WeakMap<object, SchemaRootRegistration>();
/** Live registrations expose overlapping IDs to the registration boundary. */
let active: WeakRef<SchemaRootRegistration>[] = [];
const finalizer = new FinalizationRegistry<SchemaRootRegistration>(disposeSchemaRoot);

/**
 * Ajv 6 validation and synchronous guards for schema-form.
 */
export const ajvValidatorPlugin: ConfigurableValidatorPlugin &
  Required<Pick<ValidatorPlugin, 'compileGuard' | 'release'>> = {
  /** Set direct compilation for later guards (default true); omitted options stay unchanged. */
  configure: (options) => {
    directGuardCompile = options.directGuardCompile ?? directGuardCompile;
  },
  bind: (instance: Ajv.Ajv) => {
    assertBindableInstance(instance);
    ajvInstance = instance;
    roots = new WeakMap();
    active = [];
  },
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    const registered = registerSchemaRoot(jsonSchema, ajvInstance, roots, active, finalizer);
    const validate = createValidatorFactory(
      registered.validation, registered.validationCopy ? registered.key : undefined,
    )(jsonSchema);
    return async (value: unknown): Promise<ValidationIssue[] | null> => validate(value);
  },
  compileGuard: (root, pointer) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    const registered = registerSchemaRoot(root, ajvInstance, roots, active, finalizer);
    registerSchemaGuard(root, ajvInstance, registered);
    return createGuardCompiler(registered, pointer, root, directGuardCompile, finalizer);
  },
  release: (root) => releaseSchemaRoot(root, roots, active, finalizer),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ConfigurableValidatorPlugin;
