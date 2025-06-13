import type { ValidatorPlugin } from '@canard/schema-form';
import Ajv, { type Options } from 'ajv';

import { createValidatorFactory } from './createValidatorFactory';

/**
 * Default AJV6 settings optimized for schema-form validation.
 *
 * - allErrors: true - Collect all validation errors, not just the first one
 * - verbose: true - Include additional error information
 * - format: false - Disable format validation for better performance
 */
const defaultSettings: Options = {
  allErrors: true,
  verbose: true,
  format: false,
};

let ajvInstance: Ajv | null = null;

/**
 * AJV6 validator plugin for schema-form.
 *
 * This plugin provides JSON Schema validation using AJV version 6.x.
 * It automatically converts AJV6's JSONPath format error dataPaths to
 * JSONPointer format for consistency with the schema-form library.
 *
 * @example
 * ```typescript
 * import { ajvValidatorPlugin } from '@canard/schema-form-ajv6-plugin';
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
