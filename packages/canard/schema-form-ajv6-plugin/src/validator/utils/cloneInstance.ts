import type Ajv from 'ajv';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv6:';

/**
 * Clone a bound Ajv 6 profile, including consumer schemas and keywords.
 * @param instance - Bound instance whose options, formats, keywords and consumer schemas are copied
 * @param allErrors - Error collection of the clone
 * @param validateSchema - Schema validation of the clone; defaults to the bound instance's setting
 * @returns A new instance of the bound instance's class
 */
export const cloneInstance = (
  instance: Ajv.Ajv,
  allErrors: boolean,
  validateSchema: Ajv.Options['validateSchema'] = instance._opts.validateSchema,
): Ajv.Ajv => {
  const Constructor = instance.constructor;
  const clone = new Constructor({ ...instance._opts, allErrors, validateSchema });
  for (const [name, format] of Object.entries(instance._formats))
    clone.addFormat(name, format);
  for (const name of Object.keys(clone.RULES.keywords))
    if (!instance.RULES.keywords[name]) clone.removeKeyword(name);
  for (const name of Object.keys(instance.RULES.custom)) {
    if (clone.getKeyword(name)) clone.removeKeyword(name);
    clone.addKeyword(name, instance.RULES.custom[name].definition);
  }
  for (const name of Object.keys(instance.RULES.keywords))
    if (!clone.RULES.keywords[name]) clone.addKeyword(name);
  for (const [key, env] of Object.entries(instance._schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !clone._schemas[key])
      clone.addSchema(env.schema, key);
  return clone;
};
