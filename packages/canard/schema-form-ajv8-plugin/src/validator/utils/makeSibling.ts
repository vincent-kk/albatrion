import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** Registration keys belong to this plugin and must not enter a sibling. */
export const PLUGIN_KEY_PREFIX = 'https://canard.invalid/ajv8/';

/** Clone the bound profile, including consumer schemas and bare keywords. */
export const makeSibling = (baseAjv: Ajv, allErrors: boolean): Ajv => {
  const Constructor = baseAjv.constructor as new (options: Options) => Ajv;
  const sibling = new Constructor({ ...baseAjv.opts, allErrors });
  for (const [name, format] of Object.entries(baseAjv.formats))
    if (format !== undefined) sibling.addFormat(name, format);
  for (const name of Object.keys(baseAjv.RULES.all)) {
    if (sibling.getKeyword(name)) continue;
    const keyword = baseAjv.getKeyword(name);
    if (typeof keyword === 'object') sibling.addKeyword(keyword);
  }
  for (const name of Object.keys(baseAjv.RULES.keywords))
    if (!sibling.RULES.keywords[name]) sibling.addKeyword(name);
  for (const [key, env] of Object.entries(baseAjv.schemas))
    if (env && !key.startsWith(PLUGIN_KEY_PREFIX) && !sibling.schemas[key])
      sibling.addSchema(env.schema, key);
  return sibling;
};
