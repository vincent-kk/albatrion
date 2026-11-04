import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv7:';

/**
 * Clone a bound Ajv 7 profile, including consumer schemas and keywords.
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
  const clone = new Constructor({ ...instance.opts, allErrors, validateSchema });
  for (const [name, format] of Object.entries(instance.formats))
    if (format !== undefined) clone.addFormat(name, format);
  for (const name of Object.keys(instance.RULES.keywords)) {
    if (clone.RULES.keywords[name]) continue;
    const definition = instance.getKeyword(name);
    if (definition && typeof definition === 'object') clone.addKeyword(definition);
    else clone.addKeyword(name);
  }
  for (const [key, env] of Object.entries(instance.schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !clone.schemas[key])
      clone.addSchema(env.schema, key);
  return clone;
};
