import type { ModelApplication, ModelProfile } from './types';
import { readOracleResource } from './readOracleResource';

/** Rebuild requested raw references and current meta documents, never reusing compiled environments. */
export const createFreshOracle = <T extends ModelApplication>(
  source: T,
  profile: ModelProfile<T>,
  root: object | boolean = {},
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
        (!isMeta || !Reflect.get(entry, 'meta')) ||
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
  const imported = new Set<unknown>();
  const claimed = new Map<string, { schema: unknown; key: string }>();
  const importReferences = (schema: unknown, base = '') => {
    if (!schema || typeof schema !== 'object') return;
    if (Array.isArray(schema)) { for (const child of schema) importReferences(child, base); return; }
    const nativeOptions = Reflect.get(source, '_opts');
    const legacyId = profile.version === 6 && nativeOptions && typeof nativeOptions === 'object' && Reflect.get(nativeOptions, 'schemaId') === 'id';
    const ownId = Reflect.get(schema, legacyId ? 'id' : '$id');
    const current = typeof ownId === 'string' ? new URL(ownId, base || 'https://oracle.invalid/').href : base;
    const ref = Reflect.get(schema, '$ref');
    if (typeof ref === 'string' && ref[0] !== '#') {
      const address = new URL(ref, current || 'https://oracle.invalid/').href;
      const resource = readOracleResource(source, address);
      if (resource && !imported.has(resource.schema)) {
        const id = resource.schema && typeof resource.schema === 'object' ? Reflect.get(resource.schema, '$id') ?? Reflect.get(resource.schema, 'id') : undefined;
        if (typeof id === 'string') {
          const normalized = new URL(id, resource.key).href.replace(/#\/?$/, '');
          const previous = claimed.get(normalized);
          if (previous && previous.schema !== resource.schema) throw new Error(`Conflicting application schema id "${normalized}" through keys "${previous.key}" and "${address}"`);
          claimed.set(normalized, { schema: resource.schema, key: address });
        }
        imported.add(resource.schema);
        const copy = JSON.parse(JSON.stringify(resource.schema));
        fresh.addSchema(copy, resource.key);
        importReferences(resource.schema, resource.key);
      }
    }
    for (const [name, child] of Object.entries(schema)) if (!['const', 'enum', 'default'].includes(name)) importReferences(child, current);
  };
  importReferences(root);
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
