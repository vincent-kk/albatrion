import type Ajv from 'ajv';
import type { Options } from 'ajv';

/** Clone a bound Ajv 7 profile, including formats and custom keywords. */
export const cloneInstance = (instance: Ajv, allErrors: boolean): Ajv => {
  const Constructor = instance.constructor as new (options?: Options) => Ajv;
  const clone = new Constructor({ ...instance.opts, allErrors });
  for (const [name, format] of Object.entries(instance.formats))
    if (format !== undefined) clone.addFormat(name, format);
  for (const name of Object.keys(instance.RULES.keywords)) {
    if (clone.getKeyword(name)) continue;
    const definition = instance.getKeyword(name);
    if (definition === true) clone.addKeyword(name);
    else if (definition) clone.addKeyword(definition);
  }
  return clone;
};
