import type { ValidatorPlugin } from '@canard/schema-form';
import AjvModule, { type Options } from 'ajv';

import type { AjvInstance as Ajv } from './types/AjvInstance';

import { createValidator } from './createValidator';
import { resolveAjvConstructor } from './utils/resolveAjvConstructor';

/**
 * ajv@7's `module.exports` is an ESM-interop namespace, not the class, so the
 * constructor has to be unwrapped rather than used straight off the import.
 */
const AjvConstructor = resolveAjvConstructor(AjvModule);

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
  multipleOfPrecision: 9,
};

/** The consumer binding is process-wide, as required by ValidatorPlugin.bind. */
let validator: ReturnType<typeof createValidator> | undefined;
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
const makeValidator = (instance = new AjvConstructor(defaultSettings)) =>
  createValidator(instance, undefined, () => directGuardCompile);

/**
 * AJV7 validator plugin for schema-form.
 *
 * This plugin provides JSON Schema validation using AJV version 7.x.
 * AJV7 uses JSONPointer format for error instancePaths by default,
 * which provides better consistency with the schema-form library.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@canard/schema-form';
 * import { plugin } from '@canard/schema-form-ajv7-plugin';
 * import Ajv from 'ajv';
 *
 * // Use a custom AJV instance: bind it before registering
 * plugin.validator.bind(new Ajv({ allErrors: false }));
 * registerPlugin(plugin);
 * ```
 */
export const ajvValidatorPlugin: ConfigurableValidatorPlugin &
  Required<Pick<ValidatorPlugin, 'bind' | 'compileGuard' | 'release'>> = {
  /** Set direct compilation for later guards (default true); omitted options stay unchanged. */
  configure: (options) => {
    directGuardCompile = options.directGuardCompile ?? directGuardCompile;
  },
  bind: (instance: Ajv) => {
    validator = makeValidator(instance);
  },
  compile: (schema) => (validator ??= makeValidator()).compile(schema),
  compileGuard: (root, pointer) => (validator ??= makeValidator()).compileGuard(root, pointer),
  release: (root) => validator?.release(root),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ConfigurableValidatorPlugin;
