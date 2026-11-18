import type { Ajv } from 'ajv';
import type { Options } from 'ajv';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'https://canard.invalid/ajv8/';

/**
 * Isolate schema caches while keeping the bound formats and keyword registries live.
 * @param baseAjv - Bound instance whose options, formats, keywords and consumer schemas are copied
 * @param allErrors - Error collection of the sibling
 * @param validateSchema - Schema validation of the sibling; defaults to the bound instance's setting
 * @returns A new instance of the bound instance's class
 */
export const makeSibling = (
  baseAjv: Ajv,
  allErrors: boolean,
  validateSchema: Options['validateSchema'] = baseAjv.opts.validateSchema,
): Ajv => {
  const Constructor = baseAjv.constructor as new (options: Options) => Ajv;
  const sibling = new Constructor({ ...baseAjv.opts, allErrors, validateSchema });
  // Schema caches are isolated; future compiles read the bound instance's live rules.
  Object.defineProperties(sibling, {
    formats: { value: baseAjv.formats },
    RULES: { value: baseAjv.RULES },
  });
  for (const [key, env] of Object.entries(baseAjv.schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !sibling.schemas[key])
      sibling.addSchema(env.schema, key);
  return sibling;
};
