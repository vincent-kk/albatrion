import type AjvModule from 'ajv';

type Ajv = AjvModule.Ajv;

import { registerApplicationSchemas } from './registerApplicationSchemas';

/** Builds a native compiler with independent registries, code and extension tables. */
export const cloneInstance = (
  instance: Ajv,
  kind: 'guard' | 'validation',
): Ajv => {
  const Constructor = instance.constructor;
  const options = instance._opts;
  const validateSchema = kind === 'guard' ? false : options.validateSchema;
  const sibling = new Constructor({
    ...options, schemas: undefined, keywords: undefined, formats: undefined,
    cache: Object.assign(new Map(), { put: Map.prototype.set, del: Map.prototype.delete }),
    serialize: false, meta: false, validateSchema: false, $data: false, nullable: false,
    allErrors: kind === 'guard' ? false : options.allErrors, jsonPointers: kind === 'validation' || options.jsonPointers, errorDataPath: kind === 'validation' ? 'object' : options.errorDataPath,
  });
  if (sibling === instance || sibling._opts === options || sibling._schemas === instance._schemas ||
      sibling._refs === instance._refs || sibling.RULES === instance.RULES ||
      sibling._formats === instance._formats || sibling._compilations === instance._compilations ||
      Reflect.get(sibling, '_cache') === Reflect.get(instance, '_cache'))
    throw new Error('AJV isolation compiler creation failed: constructor shares native state');
  if (Object.keys(sibling._schemas).length || Object.keys(sibling._refs).length)
    throw new Error('AJV isolation compiler creation failed: constructor registers bootstrap schemas');
  for (const [key, format] of Object.entries(instance._formats))
    if (format !== undefined) sibling.addFormat(key, format);
  const rules = instance.RULES;
  Object.defineProperty(sibling, 'RULES', { value: Object.assign(
    rules.map((group) => ({ ...group, rules: [...group.rules] })), {
      all: { ...rules.all }, custom: { ...rules.custom }, keywords: { ...rules.keywords }, types: { ...rules.types },
    },
  ) });
  registerApplicationSchemas(instance, sibling);
  if (kind === 'validation') Reflect.set(sibling._opts, '_errorDataPathProperty', false);
  Object.assign(sibling._opts, { meta: options.meta, $data: options.$data, nullable: options.nullable, validateSchema, addUsedSchema: false });
  return sibling;
};
