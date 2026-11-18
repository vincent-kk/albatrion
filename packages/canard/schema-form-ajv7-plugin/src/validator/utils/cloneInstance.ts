import type { Options } from 'ajv';

import type { AjvInstance as Ajv } from '../types/AjvInstance';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv7:';

/**
 * Isolate schema caches while keeping the bound formats and keyword registries live.
 * @param instance - Bound instance whose options, formats, keywords and consumer schemas are copied
 * @param allErrors - Error collection of the clone
 * @param validateSchema - Schema validation of the clone; defaults to the bound instance's setting
 * @returns A new instance of the bound instance's class
 */
export const cloneInstance = (
  instance: Ajv,
  allErrors: boolean,
  validateSchema: Options['validateSchema'] = instance.opts.validateSchema,
): Ajv => {
  const Constructor = instance.constructor as new (options?: Options) => Ajv;
  const clone = new Constructor({
    ...instance.opts,
    allErrors,
    validateSchema,
  });
  // Schema caches are isolated; future compiles read the bound instance's live rules.
  Object.defineProperties(clone, {
    formats: { value: instance.formats },
    RULES: { value: instance.RULES },
  });
  for (const [key, env] of Object.entries(instance.schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !clone.schemas[key])
      clone.addSchema(env.schema, key);
  return clone;
};
