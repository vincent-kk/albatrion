import type { ModelApplication, ModelProfile } from './types';

/** Rebuild every currently registered raw document, never reusing native compiled environments. */
export const createFreshOracle = <T extends ModelApplication>(
  source: T,
  profile: ModelProfile<T>,
): T => {
  const fresh = profile.createFresh(source);
  const schemas =
    Reflect.get(source, '_schemas') ?? Reflect.get(source, 'schemas');
  const refs = Reflect.get(source, '_refs') ?? Reflect.get(source, 'refs');
  if (
    !schemas ||
    typeof schemas !== 'object' ||
    !refs ||
    typeof refs !== 'object'
  )
    throw new TypeError('Oracle registries are missing');
  const copied = new Map<unknown, object | boolean>();
  const entries = [...Object.entries(schemas), ...Object.entries(refs)];
  for (const isMeta of [true, false])
    for (const [key, entry] of entries) {
      if (
        !entry ||
        typeof entry !== 'object' ||
        !('schema' in entry) ||
        !!Reflect.get(entry, 'meta') !== isMeta ||
        !key ||
        (profile.version !== 6 &&
          'root' in entry &&
          entry.root &&
          entry.root !== entry)
      )
        continue;
      if (
        profile.version === 6 &&
        'root' in entry &&
        entry.root &&
        (typeof entry.root === 'object' || typeof entry.root === 'function') &&
        Reflect.get(entry.root, 'schema') !== entry.schema
      )
        continue;
      let schema = copied.get(entry);
      if (schema === undefined) {
        schema = JSON.parse(JSON.stringify(entry.schema));
        if (schema === undefined) throw new Error('Oracle schema is missing');
        copied.set(entry, schema);
      }
      const targetSchemas =
        Reflect.get(fresh, '_schemas') ?? Reflect.get(fresh, 'schemas');
      if (!targetSchemas || typeof targetSchemas !== 'object')
        throw new TypeError('Oracle schema registry is missing');
      if (Object.prototype.hasOwnProperty.call(targetSchemas, key)) continue;
      if (isMeta && typeof schema === 'object')
        profile.addMeta(fresh, schema, key);
      else fresh.addSchema(schema, key);
    }
  const targetRefs = Reflect.get(fresh, '_refs') ?? Reflect.get(fresh, 'refs');
  if (!targetRefs || typeof targetRefs !== 'object')
    throw new TypeError('Oracle reference registry is missing');
  for (const key of Object.keys(targetRefs))
    if (!Object.prototype.hasOwnProperty.call(refs, key))
      Reflect.deleteProperty(targetRefs, key);
  for (const [key, entry] of Object.entries(refs))
    if (typeof entry === 'string') Reflect.set(targetRefs, key, entry);
  const sourceOptions =
    Reflect.get(source, '_opts') ?? Reflect.get(source, 'opts');
  const options = Reflect.get(fresh, '_opts') ?? Reflect.get(fresh, 'opts');
  if (
    options &&
    typeof options === 'object' &&
    sourceOptions &&
    typeof sourceOptions === 'object'
  ) {
    Reflect.set(
      options,
      'validateSchema',
      Reflect.get(sourceOptions, 'validateSchema'),
    );
    const configuredMeta = Reflect.get(sourceOptions, 'meta');
    if (configuredMeta && typeof configuredMeta === 'object') {
      const address =
        Reflect.get(configuredMeta, '$id') ?? Reflect.get(configuredMeta, 'id');
      if (typeof address === 'string')
        Reflect.set(options, 'defaultMeta', address);
    }
    if (profile.version === 6) {
      Reflect.set(options, 'jsonPointers', true);
      Reflect.set(options, 'errorDataPath', 'object');
      Reflect.set(options, '_errorDataPathProperty', false);
    }
  }
  return fresh;
};
