import type Ajv from 'ajv';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'urn:canard:schema-form:ajv6:';

/** Clone a bound Ajv 6 profile, including consumer schemas and keywords. */
export const cloneInstance = (instance: Ajv.Ajv, allErrors: boolean): Ajv.Ajv => {
  const Constructor = instance.constructor;
  const clone = new Constructor({ ...instance._opts, allErrors });
  for (const [name, format] of Object.entries(instance._formats))
    clone.addFormat(name, format);
  for (const name of Object.keys(instance.RULES.custom)) {
    if (clone.getKeyword(name)) continue;
    clone.addKeyword(name, instance.RULES.custom[name].definition);
  }
  for (const name of Object.keys(instance.RULES.keywords))
    if (!clone.RULES.keywords[name]) clone.addKeyword(name);
  for (const [key, env] of Object.entries(instance._schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !clone._schemas[key])
      clone.addSchema(env.schema, key);
  return clone;
};
