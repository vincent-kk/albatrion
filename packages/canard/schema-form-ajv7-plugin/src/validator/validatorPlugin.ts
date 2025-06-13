import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv';

import { createValidatorFactory } from './createValidatorFactory';

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

let ajvInstance: Ajv | null = null;

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
export const ajvValidatorPlugin: ValidatorPlugin = {
  bind: (instance: Ajv) => (ajvInstance = instance),
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    return createValidatorFactory(ajvInstance)(jsonSchema);
  },
};
