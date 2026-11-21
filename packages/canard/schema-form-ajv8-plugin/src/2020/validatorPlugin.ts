// `.js` is required, not cosmetic: ajv ships no `exports` map, so Node's ESM
// resolver takes this subpath literally and will not try extensions.
import AjvConstructor from 'ajv/dist/2020.js';

import { createValidatorFactory } from '../validator/createValidatorFactory';
import { createValidatorPlugin } from '../validator/utils/createValidatorPlugin';

export { createValidatorFactory };

/**
 * AJV8 validator plugin for schema-form (Draft 2020-12 version).
 *
 * This plugin provides JSON Schema validation using AJV version 8.x
 * with Draft 2020-12 support. Unlike AJV6, AJV8 already uses JSONPointer
 * format for error dataPaths, so no path transformation is needed.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@canard/schema-form';
 * import { plugin } from '@canard/schema-form-ajv8-plugin/2020';
 * import Ajv2020 from 'ajv/dist/2020.js';
 *
 * // Use a custom AJV instance: bind it before registering
 * plugin.validator.bind(new Ajv2020({ allErrors: false }));
 * registerPlugin(plugin);
 * ```
 */
export const ajvValidatorPlugin = createValidatorPlugin(AjvConstructor, 'https://json-schema.org/draft/2020-12/schema');
