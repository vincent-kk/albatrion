import type { JSONSchema, ValidateFunction, ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv';

import { createGuardCompiler } from '../validator/createGuardCompiler';
import { createValidatorFactory } from '../validator/createValidatorFactory';
import { assertBindableInstance } from '../validator/utils/assertBindableInstance';
import { type SchemaRootRegistry } from '../validator/utils/registerSchemaRoot';
import { releaseSchemaRoot } from '../validator/utils/releaseSchemaRoot';

export { createValidatorFactory };

/**
 * Default AJV8 settings optimized for schema-form validation.
 *
 * - allErrors: true - Collect all validation errors, not just the first one
 * - strictSchema: false - Allow additional schema properties for flexibility
 * - validateFormats: false - Disable format validation for better performance
 */
const defaultSettings: Options = {
  allErrors: true,
  strictSchema: false,
  validateFormats: false,
  allowUnionTypes: true,
};

let ajvInstance: Ajv | null = null;
/** Root registrations persist across process-wide `bind` calls until release. */
const roots: SchemaRootRegistry = { entries: new Map(), usedBases: new WeakSet(), nextId: 0 };

/** Returns the currently bound instance, creating the default on first use. */
const getInstance = (): Ajv => {
  ajvInstance ??= new Ajv(defaultSettings);
  return ajvInstance;
};

/**
 * AJV8 validator plugin for schema-form (Draft-07 compatible version).
 *
 * This plugin provides JSON Schema validation using AJV version 8.x
 * with Draft-07 compatibility. Unlike AJV6, AJV8 already uses JSONPointer
 * format for error dataPaths, so no path transformation is needed.
 *
 * For Draft 2020-12 support, use '@canard/schema-form-ajv8-plugin/2020'.
 *
 * @example
 * ```typescript
 * import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
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
export const ajvValidatorPlugin = {
  bind: (instance: Ajv) => {
    assertBindableInstance(instance);
    ajvInstance = instance;
  },
  compile: (jsonSchema: JSONSchema): ValidateFunction => createValidatorFactory(getInstance(), roots)(jsonSchema),
  compileGuard: (root: JSONSchema, pointer: string): ((value: unknown) => boolean) => createGuardCompiler(getInstance(), roots, root, pointer),
  release: (root: JSONSchema): void => releaseSchemaRoot(roots, root),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ValidatorPlugin;
