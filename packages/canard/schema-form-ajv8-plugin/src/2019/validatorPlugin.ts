// `.js` is required, not cosmetic: ajv ships no `exports` map, so Node's ESM
// resolver takes this subpath literally and will not try extensions.
import AjvConstructor, { type Ajv2019 } from 'ajv/dist/2019.js';

import { createValidatorFactory } from '../validator/createValidatorFactory';
import { createValidatorPlugin } from '../validator/utils/createValidatorPlugin';

export { createValidatorFactory };

/**
 * AJV8 validator plugin for schema-form (Draft 2019-09 version).
 *
 * This plugin provides JSON Schema validation using AJV version 8.x
 * with Draft 2019-09 support. Unlike AJV6, AJV8 already uses JSONPointer
 * format for error dataPaths, so no path transformation is needed.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@canard/schema-form';
 * import { plugin } from '@canard/schema-form-ajv8-plugin/2019';
 * import Ajv2019 from 'ajv/dist/2019.js';
 *
 * // Use a custom AJV instance: bind it before registering
 * plugin.validator.bind(new Ajv2019({ allErrors: false }));
 * registerPlugin(plugin);
 * ```
 */
export const ajvValidatorPlugin: ReturnType<typeof createValidatorPlugin<Ajv2019>> = createValidatorPlugin(AjvConstructor, 'https://json-schema.org/draft/2019-09/schema');
