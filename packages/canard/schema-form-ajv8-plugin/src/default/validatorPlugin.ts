import AjvConstructor from 'ajv';

import { createValidatorFactory } from '../validator/createValidatorFactory';
import { createValidatorPlugin } from '../validator/utils/createValidatorPlugin';

export { createValidatorFactory };

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
 * import { registerPlugin } from '@canard/schema-form';
 * import { plugin } from '@canard/schema-form-ajv8-plugin';
 * import Ajv from 'ajv';
 *
 * // Use a custom AJV instance: bind it before registering
 * plugin.validator.bind(new Ajv({ allErrors: false }));
 * registerPlugin(plugin);
 * ```
 */
export const ajvValidatorPlugin = createValidatorPlugin(AjvConstructor, 'http://json-schema.org/draft-07/schema#');
