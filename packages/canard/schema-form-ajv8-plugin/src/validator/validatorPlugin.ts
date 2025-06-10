import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv';

import { createValidatorFactory } from './createValidatorFactory';

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
};

let ajvInstance: Ajv | null = null;

/**
 * AJV8 validator plugin for schema-form.
 *
 * This plugin provides JSON Schema validation using AJV version 8.x.
 * Unlike AJV6, AJV8 already uses JSONPointer format for error dataPaths,
 * so no path transformation is needed.
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
export const ajvValidatorPlugin: ValidatorPlugin = {
  bind: (instance: Ajv) => (ajvInstance = instance),
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    return createValidatorFactory(ajvInstance)(jsonSchema);
  },
};
