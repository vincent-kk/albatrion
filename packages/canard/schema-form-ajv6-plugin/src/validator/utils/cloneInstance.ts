import type Ajv from 'ajv';

/** Clone a bound Ajv 6 profile, including formats and custom keywords. */
export const cloneInstance = (instance: Ajv.Ajv, allErrors: boolean): Ajv.Ajv => {
  const Constructor = instance.constructor as typeof Ajv;
  const clone = new Constructor({ ...instance._opts, allErrors });
  const source = instance as Ajv.Ajv & {
    _formats: Record<string, Parameters<Ajv.Ajv['addFormat']>[1]>;
    RULES: {
      custom: Record<string, { definition: Ajv.KeywordDefinition }>;
      keywords: Record<string, boolean>;
    };
  };
  for (const [name, format] of Object.entries(source._formats))
    clone.addFormat(name, format);
  for (const name of Object.keys(source.RULES.custom)) {
    if (clone.getKeyword(name)) continue;
    clone.addKeyword(name, source.RULES.custom[name].definition);
  }
  for (const name of Object.keys(source.RULES.keywords))
    if (!clone.getKeyword(name)) clone.addKeyword(name);
  return clone;
};
