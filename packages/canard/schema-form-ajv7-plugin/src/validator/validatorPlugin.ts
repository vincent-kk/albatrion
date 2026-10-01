import type { ValidationIssue, ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv';

import { createValidatorFactory } from './createValidatorFactory';
import { createGuardCompiler } from './createGuardCompiler';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { registerSchemaRoot, registerSchemaGuard, type SchemaCompilerPool, type SchemaRootRegistration } from './utils/registerSchemaRoot';
import { disposeSchemaRoot, releaseSchemaRoot } from './utils/releaseSchemaRoot';
import { resolveAjvConstructor } from './utils/resolveAjvConstructor';

/**
 * ajv@7's `module.exports` is an ESM-interop namespace, not the class, so the
 * constructor has to be unwrapped rather than used straight off the import.
 */
const AjvConstructor = resolveAjvConstructor(Ajv);

/**
 * Default AJV7 settings optimized for schema-form validation.
 *
 * - allErrors: true - Collect all validation errors, not just the first one
 * - strict: false - Disable strict mode for better compatibility with existing schemas
 * - validateFormats: false - Disable format validation for better performance
 */
const defaultSettings: Options = {
  allErrors: true,
  strict: false,
  validateFormats: false,
};

/** The consumer binding is process-wide, as required by ValidatorPlugin.bind. */
let ajvInstance: Ajv | null = null;
/** Root registrations belong to the current binding. */
let roots = new WeakMap<object, SchemaRootRegistration>();
/** Live registrations expose overlapping IDs to the registration boundary. */
let active: WeakRef<SchemaRootRegistration>[] = [];
const finalizer = new FinalizationRegistry<SchemaRootRegistration>(disposeSchemaRoot);
let pool: SchemaCompilerPool | null = null;

/** Share one compiler for up to 64 ID-free roots, then retire its Ajv code scope. */
const getPool = (instance: Ajv): SchemaCompilerPool => {
  if (!pool || pool.base !== instance) pool = { base: instance, current: instance, count: 0 };
  return pool;
};

/**
 * AJV7 validator plugin for schema-form.
 *
 * This plugin provides JSON Schema validation using AJV version 7.x.
 * AJV7 uses JSONPointer format for error instancePaths by default,
 * which provides better consistency with the schema-form library.
 *
 * @example
 * ```typescript
 * import { ajvValidatorPlugin } from '@canard/schema-form-ajv7-plugin';
 *
 * // Use with custom AJV instance
 * const customAjv = new Ajv({ allErrors: false });
 * ajvValidatorPlugin.bind(customAjv);
 *
 * // Compile a validator
 * const validator = ajvValidatorPlugin.compile(schema);
 * const errors = await validator(data);
 * ```
 */
export const ajvValidatorPlugin: ValidatorPlugin &
  Required<Pick<ValidatorPlugin, 'compileGuard' | 'release'>> = {
  bind: (instance: Ajv) => {
    assertBindableInstance(instance);
    ajvInstance = instance;
    roots = new WeakMap();
    active = [];
    pool = null;
  },
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new AjvConstructor(defaultSettings);
    const registered = registerSchemaRoot(jsonSchema, ajvInstance, roots, active, finalizer, getPool(ajvInstance));
    const validate = createValidatorFactory(
      registered.validation, registered.validationCopy ? registered.key : undefined,
    )(jsonSchema);
    return async (value: unknown): Promise<ValidationIssue[] | null> => validate(value);
  },
  compileGuard: (root, pointer) => {
    if (!ajvInstance) ajvInstance = new AjvConstructor(defaultSettings);
    const registered = registerSchemaRoot(root, ajvInstance, roots, active, finalizer, getPool(ajvInstance));
    registerSchemaGuard(root, ajvInstance, registered);
    return createGuardCompiler(registered, pointer);
  },
  release: (root) => releaseSchemaRoot(root, roots, active, finalizer),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ValidatorPlugin;
