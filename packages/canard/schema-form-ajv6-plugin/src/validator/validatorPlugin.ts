import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv from 'ajv';

import { createValidator } from './createValidator';

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
const makeValidator = (instance = new Ajv(defaultSettings)) =>
  createValidator(instance, undefined, () => directGuardCompile);

/**
 * Ajv 6 validation and synchronous guards for schema-form.
 */
export const ajvValidatorPlugin: ConfigurableValidatorPlugin &
  Required<Pick<ValidatorPlugin, 'bind' | 'compileGuard' | 'release'>> = {
  /** Set direct compilation for later guards (default true); omitted options stay unchanged. */
  configure: (options) => {
    directGuardCompile = options.directGuardCompile ?? directGuardCompile;
  },
  bind: (instance: Ajv.Ajv) => {
    validator = makeValidator(instance);
  },
  compile: (schema) => (validator ??= makeValidator()).compile(schema),
  compileGuard: (root, pointer) => (validator ??= makeValidator()).compileGuard(root, pointer),
  release: (root) => validator?.release(root),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ConfigurableValidatorPlugin;
