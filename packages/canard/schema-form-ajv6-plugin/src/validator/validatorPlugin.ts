import type { ValidatorPlugin } from '@canard/schema-form';
import type { Ajv, Options } from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { createDefaultInstance } from './utils/createDefaultInstance';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { releaseSchemaRoot } from './utils/releaseSchemaRoot';

/**
 * Default AJV6 settings optimized for schema-form validation.
 *
 * - allErrors: true - Collect all validation errors, not just the first one
 * - strict: false - Disable strict mode for better compatibility with existing schemas
 * - validateFormats: false - Disable format validation for better performance
 */
const defaultSettings: Options = {
  allErrors: true,
  multipleOfPrecision: 9,
  nullable: true,
  verbose: true,
  format: false,
};

/** The consumer binding is process-wide, as required by ValidatorPlugin.bind. */
let ajvInstance: Ajv | null = null;
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
/** Root selections reset on binding; native resources remain in their instance ledger. */
let roots = createSchemaRootRegistry();

/**
 * AJV6 validator plugin for schema-form.
 *
 * This plugin provides JSON Schema validation using AJV version 7.x.
 * AJV6 uses JSONPointer format for error instancePaths by default,
 * which provides better consistency with the schema-form library.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@canard/schema-form';
 * import { plugin } from '@canard/schema-form-ajv6-plugin';
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
    assertBindableInstance(instance);
    ajvInstance = instance;
    roots = createSchemaRootRegistry();
  },
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = createDefaultInstance(defaultSettings);
    return createValidatorFactory(ajvInstance, undefined, roots)(jsonSchema);
  },
  compileGuard: (root, pointer) => {
    if (!ajvInstance) ajvInstance = createDefaultInstance(defaultSettings);
    return createGuardCompiler(
      ajvInstance,
      roots,
      root,
      pointer,
      directGuardCompile,
    );
  },
  release: (root) => releaseSchemaRoot(roots, root),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ConfigurableValidatorPlugin;
