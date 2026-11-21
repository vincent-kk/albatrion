import type { Ajv, Options } from 'ajv';

import { registerApplicationSchemas } from './registerApplicationSchemas';

/** Builds a native compiler with independent registries, code and extension tables. */
export const makeSibling = (
  instance: Ajv,
  kind: 'guard' | 'validation',
): Ajv => {
  const Constructor = instance.constructor as new (options: Options) => Ajv;
  const options = instance.opts;
  const validateSchema = kind === 'guard' ? false : options.validateSchema;
  const sibling = new Constructor({
    ...options, schemas: undefined, keywords: undefined, formats: undefined,
    code: { ...options.code }, meta: false, validateSchema: false,
    allErrors: kind === 'guard' ? false : options.allErrors,
  });
  if (sibling === instance || sibling.opts === options || sibling.schemas === instance.schemas ||
      sibling.refs === instance.refs || sibling.RULES === instance.RULES ||
      sibling.formats === instance.formats || sibling._compilations === instance._compilations ||
      Reflect.get(sibling, '_cache') === Reflect.get(instance, '_cache') || sibling.scope === instance.scope)
    throw new Error('AJV isolation compiler creation failed: constructor shares native state');
  if (Object.keys(sibling.schemas).length || Object.keys(sibling.refs).length)
    throw new Error('AJV isolation compiler creation failed: constructor registers bootstrap schemas');
  for (const [key, format] of Object.entries(instance.formats))
    if (format !== undefined) sibling.addFormat(key, format);
  Object.assign(sibling.RULES, {
    all: { ...instance.RULES.all }, keywords: { ...instance.RULES.keywords },
    types: { ...instance.RULES.types },
    post: { ...instance.RULES.post, rules: [...instance.RULES.post.rules] },
    rules: instance.RULES.rules.map((group) => ({ ...group, rules: [...group.rules] })),
  });
  registerApplicationSchemas(instance, sibling);
  Object.assign(sibling.opts, { meta: options.meta, validateSchema, addUsedSchema: false });
  return sibling;
};
